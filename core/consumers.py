from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.core.serializers import serialize
from core.models import Profile, Social, NotificationSetting, Group, Thread, Message, Mute, Files
from django.db.models import Q
import json
import os

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.sender_id = self.scope['url_route']['kwargs']['sender_id']
        self.receiver_id = self.scope['url_route']['kwargs']['receiver_id']
        self.room_group_name = f'chat_{min(self.sender_id, self.receiver_id)}_{max(self.sender_id, self.receiver_id)}'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        print(f"Closing group with {close_code}")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive(self, text_data):
        json_data = json.loads(text_data)
        action = json_data['action']
        print(text_data)
        if action == 'send_message':
            await self.receive_message(json_data)
        elif action == 'reply_message':
            await self.reply_message(json_data)
        elif action == 'edit_message':
            await self.edit_message(json_data)
        elif action == 'delete_message':
            await self.delete_message(json_data)

    async def receive_message(self, json_data):
        sender_id = self.scope['user'].id
        receiver_id = json_data['receiver_id']
        message = json_data['message']
        sender_profile = await sync_to_async(Profile.objects.get)(user__id=sender_id)
        receiver_profile = await sync_to_async(Profile.objects.get)(user__id=receiver_id)
        message_thread = await sync_to_async(Thread.objects.get)(Q(user1=sender_profile, user2=receiver_profile) | Q(user1=receiver_profile, user2=sender_profile))
        message_obj = await sync_to_async(Message.objects.create)(thread=message_thread, sender=sender_profile, receiver=receiver_profile, content=message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_message',
                'message_id': message_obj.id,
                'message': message,
                'sender_id': sender_id,
                'receiver_id': receiver_id,
                'sender_avatar': await sync_to_async(self.get_avatar)(sender_id),
                'timestamp': message_obj.timestamp.strftime('%I:%M %p'),
            })
    
    async def reply_message(self, json_data):
        sender_id = self.scope['user'].id
        receiver_id = json_data['receiver_id']
        replyTo = json_data['replyTo']
        message = json_data['message']
        sender_profile = await sync_to_async(Profile.objects.get)(user__id=sender_id)
        receiver_profile = await sync_to_async(Profile.objects.get)(user__id=receiver_id)
        message_thread = await sync_to_async(Thread.objects.get)(Q(user1=sender_profile, user2=receiver_profile) | Q(user1=receiver_profile, user2=sender_profile))
        message_reply = await sync_to_async(Message.objects.get)(id=replyTo)
        if message_reply.content:
            message_reply_content = message_reply.content
        else:
            file_name = await sync_to_async(Files.objects.get)(message_id=replyTo)
            message_reply_content = file_name.name if file_name else None

        message_obj = await sync_to_async(Message.objects.create)(thread=message_thread, sender=sender_profile, reply=message_reply, receiver=receiver_profile, content=message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_reply_message',
                'reply_id': message_reply.id,
                'reply_message': message_reply_content,
                'message_id': message_obj.id,
                'message': message,
                'sender_id': sender_id,
                'receiver_id': receiver_id,
                'sender_avatar': await sync_to_async(self.get_avatar)(sender_id),
                'receiver_avatar': await sync_to_async(self.get_avatar)(receiver_id),
                'timestamp': message_obj.timestamp.strftime('%I:%M %p'),
            })

    async def edit_message(self, json_data):
        message_id = json_data['messageId']
        new_content = json_data['newContent']

        message = await sync_to_async(Message.objects.get)(id=message_id)
        message.content = new_content
        await sync_to_async(message.save)()
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_edited_message',
                'message_id': message_id,
                'new_content': new_content,
            }
        )

    async def delete_message(self, json_data):
        messageId = json_data['messageId']
        message = await sync_to_async(Message.objects.get)(id=messageId)
        await sync_to_async(message.delete)()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_deleted_message',
                'messageId': messageId,
            }
        )

    async def send_message(self, event):
        message = event['message']
        message_id = event['message_id']
        sender_id = event['sender_id']
        receiver_id = event['receiver_id']
        sender_profile_picture = event['sender_avatar']
        timestamp = event['timestamp']

        await self.send(text_data=json.dumps({
            'action': 'send_message',
            'message_id': message_id,
            'message': message,
            'sender_id': sender_id,
            'receiver_id': receiver_id,
            'sender_profile_picture': sender_profile_picture,
            'timestamp': timestamp,
        }))

    async def send_reply_message(self, event):
        reply_message = event['reply_message']
        message = event['message']
        reply_id = event['reply_id']
        message_id = event['message_id']
        sender_id = event['sender_id']
        receiver_id = event['receiver_id']
        sender_profile_picture = event['sender_avatar']
        receiver_profile_picture = event['receiver_avatar']
        timestamp = event['timestamp']

        await self.send(text_data=json.dumps({
            'action': 'reply_message',
            'reply_id': reply_id,
            'reply_message': reply_message,
            'message_id': message_id,
            'message': message,
            'sender_id': sender_id,
            'receiver_id': receiver_id,
            'sender_profile_picture': sender_profile_picture,
            'receiver_profile_picture': receiver_profile_picture,
            'timestamp': timestamp,
        }))

    async def send_edited_message(self, event):
        message_id = event['message_id']
        new_content = event['new_content']

        await self.send(text_data=json.dumps({
            'action': 'edited_message',
            'message_id': message_id,
            'new_content': new_content,
        }))

    async def send_deleted_message(self, event):
        message_id = event['messageId']

        await self.send(text_data=json.dumps({
            'action': 'deleted_message',
            'messageId': message_id,
        }))

    async def handle_file_upload(self, event):
        sub_action = event['sub_action']
        message_id = event['message_id']
        message = event['message']
        reply_message = event['reply_message']
        sender_id = event['sender_id']
        sender_avatar = event['sender_avatar']
        timestamp = event['timestamp']
        files_name = event['files_name']
        file_extensions = event['file_extensions']
        file_sizes = event['file_sizes']
        file_urls = event['file_urls']

        await self.send(text_data=json.dumps({
            'action': 'handle_file_upload',
            'sub_action': sub_action,
            'reply_message': reply_message,
            'message_id': message_id,
            'message': message,
            'sender_id': sender_id,
            'sender_avatar': sender_avatar,
            'timestamp': timestamp,
            'files_name': files_name,
            'file_extension': file_extensions,
            'file_sizes': file_sizes,
            'file_urls': file_urls,
        }))

    async def handle_upload_with_message(self, event):
        sub_action = event['sub_action']
        reply_message = event['reply_message']
        message_id = event['message_id']
        message = event['message']
        sender_id = event['sender_id']
        sender_avatar = event['sender_avatar']
        timestamp = event['timestamp']
        files_name = event['files_name']
        file_extensions = event['file_extensions']
        file_sizes = event['file_sizes']
        file_urls = event['file_urls']

        await self.send(text_data=json.dumps({
            'action': 'handle_upload_with_message',
            'reply_message': reply_message,
            'sub_action': sub_action,
            'message_id': message_id,
            'message': message,
            'sender_id': sender_id,
            'sender_avatar': sender_avatar,
            'timestamp': timestamp,
            'files_name': files_name,
            'file_extensions': file_extensions,
            'file_sizes': file_sizes,
            'file_urls': file_urls,
        }))

    def get_avatar(self, user_id):
        return Profile.objects.get(user__id=user_id).avatar.url
    
class GroupChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.group_name = f"group_{self.group_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        print(f"Closing group with {close_code}")
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name,
        )

    async def receive(self, text_data):
        json_data = json.loads(text_data)
        action = json_data['action']

        if action == 'send_message':
            await self.receive_message(json_data)

        elif action == 'reply_message':
            await self.reply_message(json_data)
        elif action == 'edit_message':
            await self.edit_message(json_data)
        elif action == 'delete_message':
            await self.delete_message(json_data)

        elif action == 'edit_group_name':
            await self.edit_group_name(json_data)
        elif action == 'kick_member':
            await self.kick_member(json_data)
        elif action == 'mute_member':
            await self.mute_member(json_data)
        elif action == 'leave_group':
            await self.leave_group(json_data)
        elif action == 'delete_group':
            await self.delete_group(json_data)

    async def receive_message(self, json_data):
        sender_id = self.scope['user'].id
        group_id = json_data['group_id']
        message = json_data['message']
        sender_profile = await sync_to_async(Profile.objects.get)(user__id=sender_id)
        group = await sync_to_async(Group.objects.get)(id=group_id)

        try:
            mute = await sync_to_async(Mute.objects.get)(user=sender_profile, group=group)
        except Mute.DoesNotExist:
            mute = None
            
        if mute is None or mute and not mute.is_muted:
            message_obj = await sync_to_async(Message.objects.create)(sender=sender_profile, group=group, content=message)

            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'send_message',
                    'message_id': message_obj.id,
                    'message': message,
                    'sender_id': sender_id,
                    'sender_avatar': await sync_to_async(self.get_avatar)(sender_id),
                    'timestamp': message_obj.timestamp.strftime('%I:%M %p'),
                })

    async def reply_message(self, json_data):
        group_id = json_data['group_id']
        sender_id = self.scope['user'].id
        replyTo = json_data['replyTo']
        message = json_data['message']
        sender_profile = await sync_to_async(Profile.objects.get)(user__id=sender_id)
        group = await sync_to_async(Group.objects.get)(id=group_id)
        message_reply = await sync_to_async(Message.objects.get)(id=replyTo)
        if message_reply.content:
            message_reply_content = message_reply.content
        else:
            file_name = await sync_to_async(Files.objects.get)(message_id=replyTo)
            message_reply_content = file_name.name if file_name else None

        message_obj = await sync_to_async(Message.objects.create)(group=group, sender=sender_profile, reply=message_reply, content=message)
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'send_reply_message',
                'reply_id': message_reply.id,
                'message_id': message_obj.id,
                'reply_message': message_reply_content,
                'message': message,
                'sender_id': sender_id,
                'sender_avatar': await sync_to_async(self.get_avatar)(sender_id),
                'timestamp': message_obj.timestamp.strftime('%I:%M %p'),
            })

    async def edit_message(self, json_data):
        message_id = json_data['messageId']
        new_content = json_data['newContent']

        message = await sync_to_async(Message.objects.get)(id=message_id)
        message.content = new_content
        await sync_to_async(message.save)()
        
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'send_edited_message',
                'message_id': message_id,
                'new_content': new_content,
            }
        )

    async def delete_message(self, json_data):
        messageId = json_data['messageId']
        message = await sync_to_async(Message.objects.get)(id=messageId)
        await sync_to_async(message.delete)()

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'send_deleted_message',
                'messageId': messageId,
            }
        )

    async def edit_group_name(self, json_data):
        group_id = json_data['group_id']
        new_content = json_data['newContent']
        if new_content == '':
            group = await sync_to_async(Group.objects.get)(id=group_id)
            new_content = group.name
            group.name = new_content
            await sync_to_async(group.save)()
            
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'send_edited_gc_name',
                    'group_id': group_id,
                    'new_content': new_content,
                }
            )
        else:
            group = await sync_to_async(Group.objects.get)(id=group_id)
            group.name = new_content
            await sync_to_async(group.save)()
            
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'send_edited_gc_name',
                    'group_id': group_id,
                    'new_content': new_content,
                }
            )

    async def kick_member(self, json_data):
        userprofile = self.scope['user'].id
        group_id = json_data['group_id']
        member_id = json_data['member_id']
        group = await sync_to_async(Group.objects.get)(id=group_id)
        member_id = json_data['member_id']
        member = await sync_to_async(User.objects.get)(id=member_id)
        try:
            await sync_to_async(group.members.remove)(member)
            print(f"Successfully removed member {member.id} from group {group.id}")
        except Exception as e:
            print(f"Error removing member {member.id} from group {group.id}: {e}")
        
        try:
            await sync_to_async(group.save)()
            print(f"Group {group.id} saved successfully after removing member {member.id}")
        except Exception as e:
            print(f"Error saving group {group.id} after removing member {member.id}: {e}")
        member_count = await sync_to_async(group.members.all().count)()
        
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'handle_kick_member',
                'group_id': group_id,
                'member_id': member_id,
                'member_count': member_count,
            }
        )
        if userprofile == group.owner_id and member_id != userprofile:
            pass
        else:
            self.close(code=4403)
    
    async def mute_member(self, json_data):
        userprofile = self.scope['user'].id
        group_id = json_data['group_id']
        member_id = json_data['member_id']
        group = await sync_to_async(Group.objects.get)(id=group_id)

        if userprofile == group.owner_id and member_id != userprofile:
            member_id = json_data['member_id']
            member = await sync_to_async(User.objects.get)(id=member_id)
            profile = await sync_to_async(Profile.objects.get)(user=member)
            try:
                mute = await sync_to_async(Mute.objects.get)(user=profile, group=group)
                await sync_to_async(mute.delete)()
                muted = 'false'
                username = member.username
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'handle_mute_member',
                        'group_id': group_id,
                        'member_id': member_id,
                        'member_username': username,
                        'muted': muted,
                    }
                )
            except Mute.DoesNotExist:
                mute = await sync_to_async(Mute.objects.create)(user=profile, group=group, is_muted=True)
                muted = 'true'
                username = member.username
                print(username)
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'handle_mute_member',
                        'group_id': group_id,
                        'member_id': member_id,
                        'member_username': username,
                        'muted': muted,
                    }
                )
        else:
            return await self.close(code=4000)

    async def leave_group(self, json_data):
        group_id = json_data['group_id']
        member_id = self.scope['user'].id
        group = await sync_to_async(Group.objects.get)(id=group_id)
        member = await sync_to_async(User.objects.get)(id=member_id)
        await sync_to_async(group.members.remove)(member)
        await sync_to_async(group.save)()
        
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'handle_leave_group',
                'group_id': group_id,
                'member_id': member_id,
            }
        )

    async def delete_group(self, json_data):
        group_id = json_data['group_id']
        userprofile = self.scope['user'].id
        group = await sync_to_async(Group.objects.get)(id=group_id)

        if userprofile == group.owner_id:
            await sync_to_async(group.delete)()
            
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'handle_delete_group',
                    'group_id': group_id,
                }
            )
            
    async def send_message(self, event):
        message = event['message']
        message_id = event['message_id']
        sender_id = event['sender_id']
        sender_profile_picture = event['sender_avatar']
        timestamp = event['timestamp']

        await self.send(text_data=json.dumps({
            'action': 'send_message',
            'message_id': message_id,
            'message': message,
            'sender_id': sender_id,
            'sender_profile_picture': sender_profile_picture,
            'timestamp': timestamp,
        }))

    async def send_reply_message(self, event):
        reply_message = event['reply_message']
        message = event['message']
        reply_id = event['reply_id']
        message_id = event['message_id']
        sender_id = event['sender_id']
        sender_profile_picture = event['sender_avatar']
        timestamp = event['timestamp']

        await self.send(text_data=json.dumps({
            'action': 'reply_message',
            'reply_id': reply_id,
            'reply_message': reply_message,
            'message_id': message_id,
            'message': message,
            'sender_id': sender_id,
            'sender_profile_picture': sender_profile_picture,
            'timestamp': timestamp,
        }))

    async def send_edited_message(self, event):
        message_id = event['message_id']
        new_content = event['new_content']

        await self.send(text_data=json.dumps({
            'action': 'edited_message',
            'message_id': message_id,
            'new_content': new_content,
        }))

    async def send_deleted_message(self, event):
        message_id = event['messageId']

        await self.send(text_data=json.dumps({
            'action': 'deleted_message',
            'messageId': message_id,
        }))

    async def handle_file_upload(self, event):
        sub_action = event['sub_action']
        message_id = event['message_id']
        message = event['message']
        reply_message = event['reply_message']
        sender_id = event['sender_id']
        sender_avatar = event['sender_avatar']
        timestamp = event['timestamp']
        files_name = event['files_name']
        file_extensions = event['file_extensions']
        file_sizes = event['file_sizes']
        file_urls = event['file_urls']

        await self.send(text_data=json.dumps({
            'action': 'handle_file_upload',
            'sub_action': sub_action,
            'message_id': message_id,
            'reply_message': reply_message,
            'message': message,
            'sender_id': sender_id,
            'sender_avatar': sender_avatar,
            'timestamp': timestamp,
            'files_name': files_name,
            'file_extension': file_extensions,
            'file_sizes': file_sizes,
            'file_urls': file_urls,
        }))

    async def handle_upload_with_message(self, event):
        sub_action = event['sub_action']
        message_id = event['message_id']
        message = event['message']
        reply_message = event['reply_message']
        sender_id = event['sender_id']
        sender_avatar = event['sender_avatar']
        timestamp = event['timestamp']
        files_name = event['files_name']
        file_extensions = event['file_extensions']
        file_sizes = event['file_sizes']
        file_urls = event['file_urls']

        await self.send(text_data=json.dumps({
            'action': 'handle_upload_with_message',
            'sub_action': sub_action,
            'message_id': message_id,
            'message': message,
            'reply_message': reply_message,
            'sender_id': sender_id,
            'sender_avatar': sender_avatar,
            'timestamp': timestamp,
            'files_name': files_name,
            'file_extensions': file_extensions,
            'file_sizes': file_sizes,
            'file_urls': file_urls,
        }))

    async def send_edited_gc_name(self, event):
        group_id = event['group_id']
        new_content = event['new_content']

        await self.send(text_data=json.dumps({
            'action': 'edit_group_name',
            'group_id': group_id,
            'new_content': new_content,
        }))
    
    async def handle_leave_group(self, event):
        group_id = event['group_id']

        await self.send(text_data=json.dumps({
            'action': 'leave_group',
            'group_id': group_id,
        }))

    async def handle_delete_group(self, event):
        group_id = event['group_id']

        await self.send(text_data=json.dumps({
            'action': 'delete_group',
            'group_id': group_id,
        }))

    async def handle_kick_member(self, event):
        group_id = event['group_id']
        member_id = event['member_id']
        member_count = event['member_count']

        await self.send(text_data=json.dumps({
            'action': 'kick_member',
            'group_id': group_id,
            'member_id': member_id,
            'member_count': member_count,
        }))

    async def handle_mute_member(self, event):
        group_id = event['group_id']
        member_id = event['member_id']
        member_username = event['member_username']
        muted = event['muted']

        await self.send(text_data=json.dumps({
            'action': 'mute_member',
            'group_id': group_id,
            'member_id': member_id,
            'member_username': member_username,
            'muted': muted,
        }))

    def get_avatar(self, user_id):
        return Profile.objects.get(user__id=user_id).avatar.url
