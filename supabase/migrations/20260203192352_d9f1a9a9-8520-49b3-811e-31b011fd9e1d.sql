-- Add foreign key relationships for direct_messages to profiles
ALTER TABLE public.direct_messages
ADD CONSTRAINT direct_messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.direct_messages
ADD CONSTRAINT direct_messages_recipient_id_fkey
FOREIGN KEY (recipient_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;