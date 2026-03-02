export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          details: Json | null
          id: string
          image_url: string | null
          mal_id: number
          media_type: string
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          details?: Json | null
          id?: string
          image_url?: string | null
          mal_id: number
          media_type: string
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          image_url?: string | null
          mal_id?: number
          media_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          color: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          category?: string
          color?: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value?: number
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      chapter_comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "chapter_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_comments: {
        Row: {
          chapter_id: string
          content: string
          created_at: string
          id: string
          is_hidden: boolean
          likes: number
          parent_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          content: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          likes?: number
          parent_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          content?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          likes?: number
          parent_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_comments_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapter_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chapter_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_pages: {
        Row: {
          chapter_id: string
          created_at: string
          file_size: number | null
          id: string
          image_url: string
          is_standardized: boolean
          original_filename: string | null
          original_image_url: string | null
          page_number: number
        }
        Insert: {
          chapter_id: string
          created_at?: string
          file_size?: number | null
          id?: string
          image_url: string
          is_standardized?: boolean
          original_filename?: string | null
          original_image_url?: string | null
          page_number: number
        }
        Update: {
          chapter_id?: string
          created_at?: string
          file_size?: number | null
          id?: string
          image_url?: string
          is_standardized?: boolean
          original_filename?: string | null
          original_image_url?: string | null
          page_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "chapter_pages_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_reports: {
        Row: {
          chapter_id: string
          created_at: string
          description: string | null
          id: string
          report_type: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          description?: string | null
          id?: string
          report_type: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          description?: string | null
          id?: string
          report_type?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_reports_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_votes: {
        Row: {
          chapter_number: number
          created_at: string
          id: string
          manga_id: number
          updated_at: string
          user_id: string
          vote_type: string
        }
        Insert: {
          chapter_number: number
          created_at?: string
          id?: string
          manga_id: number
          updated_at?: string
          user_id: string
          vote_type: string
        }
        Update: {
          chapter_number?: number
          created_at?: string
          id?: string
          manga_id?: number
          updated_at?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: []
      }
      chapters: {
        Row: {
          chapter_number: number
          created_at: string
          creator_id: string
          format_type: string
          id: string
          page_count: number
          published_at: string | null
          rejection_reason: string | null
          scheduled_publish_at: string | null
          series_id: string
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          chapter_number: number
          created_at?: string
          creator_id: string
          format_type?: string
          id?: string
          page_count?: number
          published_at?: string | null
          rejection_reason?: string | null
          scheduled_publish_at?: string | null
          series_id: string
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          chapter_number?: number
          created_at?: string
          creator_id?: string
          format_type?: string
          id?: string
          page_count?: number
          published_at?: string | null
          rejection_reason?: string | null
          scheduled_publish_at?: string | null
          series_id?: string
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "episode_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      community_polls: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          is_multiple_choice: boolean
          options: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_multiple_choice?: boolean
          options?: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_multiple_choice?: boolean
          options?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_moderation_queue: {
        Row: {
          chapter_id: string | null
          content_type: string
          created_at: string
          creator_id: string
          flagged_reason: string | null
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          series_id: string | null
          status: string
        }
        Insert: {
          chapter_id?: string | null
          content_type: string
          created_at?: string
          creator_id: string
          flagged_reason?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          series_id?: string | null
          status?: string
        }
        Update: {
          chapter_id?: string | null
          content_type?: string
          created_at?: string
          creator_id?: string
          flagged_reason?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          series_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_moderation_queue_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_moderation_queue_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          content_id: number
          content_title: string
          content_type: string
          created_at: string
          description: string | null
          id: string
          report_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_id: number
          content_title: string
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          report_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_id?: number
          content_title?: string
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          report_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creator_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          guidelines_accepted_at: string | null
          id: string
          is_verified: boolean
          payout_status: string
          referral_code: string | null
          social_links: Json | null
          status: string
          strike_count: number
          total_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          guidelines_accepted_at?: string | null
          id?: string
          is_verified?: boolean
          payout_status?: string
          referral_code?: string | null
          social_links?: Json | null
          status?: string
          strike_count?: number
          total_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          guidelines_accepted_at?: string | null
          id?: string
          is_verified?: boolean
          payout_status?: string
          referral_code?: string | null
          social_links?: Json | null
          status?: string
          strike_count?: number
          total_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creator_referrals: {
        Row: {
          bonus_activated_at: string | null
          bonus_expires_at: string | null
          created_at: string
          has_uploaded: boolean
          id: string
          referral_code: string
          referred_user_id: string
          referrer_id: string
          updated_at: string
        }
        Insert: {
          bonus_activated_at?: string | null
          bonus_expires_at?: string | null
          created_at?: string
          has_uploaded?: boolean
          id?: string
          referral_code: string
          referred_user_id: string
          referrer_id: string
          updated_at?: string
        }
        Update: {
          bonus_activated_at?: string | null
          bonus_expires_at?: string | null
          created_at?: string
          has_uploaded?: boolean
          id?: string
          referral_code?: string
          referred_user_id?: string
          referrer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          encryption_metadata: Json | null
          id: string
          is_encrypted: boolean
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          encryption_metadata?: Json | null
          id?: string
          is_encrypted?: boolean
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          encryption_metadata?: Json | null
          id?: string
          is_encrypted?: boolean
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      discussion_replies: {
        Row: {
          content: string
          created_at: string
          discussion_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          discussion_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          discussion_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_replies_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      discussions: {
        Row: {
          anime_id: number | null
          category: string
          content: string
          created_at: string
          id: string
          manga_id: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anime_id?: number | null
          category?: string
          content: string
          created_at?: string
          id?: string
          manga_id?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anime_id?: number | null
          category?: string
          content?: string
          created_at?: string
          id?: string
          manga_id?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      dmca_requests: {
        Row: {
          admin_notes: string | null
          claimant_company: string | null
          claimant_email: string
          claimant_name: string
          content_url: string
          created_at: string
          description: string
          id: string
          original_work_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          sworn_statement: boolean
        }
        Insert: {
          admin_notes?: string | null
          claimant_company?: string | null
          claimant_email: string
          claimant_name: string
          content_url: string
          created_at?: string
          description: string
          id?: string
          original_work_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          sworn_statement?: boolean
        }
        Update: {
          admin_notes?: string | null
          claimant_company?: string | null
          claimant_email?: string
          claimant_name?: string
          content_url?: string
          created_at?: string
          description?: string
          id?: string
          original_work_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          sworn_statement?: boolean
        }
        Relationships: []
      }
      episode_comments: {
        Row: {
          anime_id: number
          content: string
          created_at: string
          episode_number: number
          id: string
          likes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          anime_id: number
          content: string
          created_at?: string
          episode_number: number
          id?: string
          likes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          anime_id?: number
          content?: string
          created_at?: string
          episode_number?: number
          id?: string
          likes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "episode_comments_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      episode_votes: {
        Row: {
          anime_id: number
          created_at: string
          episode_number: number
          id: string
          updated_at: string
          user_id: string
          vote_type: string
        }
        Insert: {
          anime_id: number
          created_at?: string
          episode_number: number
          id?: string
          updated_at?: string
          user_id: string
          vote_type: string
        }
        Update: {
          anime_id?: number
          created_at?: string
          episode_number?: number
          id?: string
          updated_at?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: []
      }
      linked_accounts: {
        Row: {
          access_token: string
          created_at: string
          id: string
          provider: string
          provider_user_id: string
          provider_username: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          provider: string
          provider_user_id: string
          provider_username?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          provider?: string
          provider_user_id?: string
          provider_username?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      list_entries: {
        Row: {
          created_at: string
          entry_type: string | null
          id: string
          image_url: string | null
          list_id: string
          mal_id: number
          media_type: string
          note: string | null
          position: number
          title: string
        }
        Insert: {
          created_at?: string
          entry_type?: string | null
          id?: string
          image_url?: string | null
          list_id: string
          mal_id: number
          media_type?: string
          note?: string | null
          position?: number
          title: string
        }
        Update: {
          created_at?: string
          entry_type?: string | null
          id?: string
          image_url?: string | null
          list_id?: string
          mal_id?: number
          media_type?: string
          note?: string | null
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_entries_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "user_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      list_likes: {
        Row: {
          created_at: string
          id: string
          list_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          list_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          list_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_likes_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "user_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      media_reactions: {
        Row: {
          created_at: string
          id: string
          media_id: number
          media_type: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_id: number
          media_type: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_id?: number
          media_type?: string
          reaction?: string
          user_id?: string
        }
        Relationships: []
      }
      media_votes: {
        Row: {
          created_at: string
          id: string
          media_id: number
          media_type: string
          updated_at: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_id: number
          media_type: string
          updated_at?: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          media_id?: number
          media_type?: string
          updated_at?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          media_id: number
          media_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          media_id: number
          media_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          media_id?: number
          media_type?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_read: boolean
          media_id: number
          media_type: string
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          media_id: number
          media_type?: string
          message: string
          title?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          media_id?: number
          media_type?: string
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          creator_id: string
          id: string
          method: string
          notes: string | null
          paid_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          creator_id: string
          id?: string
          method?: string
          notes?: string | null
          paid_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          creator_id?: string
          id?: string
          method?: string
          notes?: string | null
          paid_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "community_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          is_public: boolean
          location: string | null
          updated_at: string
          user_id: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_public?: boolean
          location?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_public?: boolean
          location?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      series: {
        Row: {
          approved_chapters_count: number
          content_rating: string
          cover_image_url: string | null
          created_at: string
          creator_id: string
          description: string | null
          genre_tags: string[] | null
          id: string
          language: string
          reading_direction: string
          rejection_reason: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_chapters_count?: number
          content_rating?: string
          cover_image_url?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          genre_tags?: string[] | null
          id?: string
          language?: string
          reading_direction?: string
          rejection_reason?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_chapters_count?: number
          content_rating?: string
          cover_image_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          genre_tags?: string[] | null
          id?: string
          language?: string
          reading_direction?: string
          rejection_reason?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      series_analytics: {
        Row: {
          created_at: string
          earnings: number
          id: string
          likes: number
          month: string
          series_id: string
          updated_at: string
          views: number
        }
        Insert: {
          created_at?: string
          earnings?: number
          id?: string
          likes?: number
          month: string
          series_id: string
          updated_at?: string
          views?: number
        }
        Update: {
          created_at?: string
          earnings?: number
          id?: string
          likes?: number
          month?: string
          series_id?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "series_analytics_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      series_follows: {
        Row: {
          created_at: string
          id: string
          series_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          series_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          series_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_follows_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_submissions: {
        Row: {
          admin_notes: string | null
          chapter_urls: string[] | null
          cover_url: string | null
          created_at: string
          description: string
          email: string
          genre: string
          id: string
          name: string
          reviewed_at: string | null
          reviewed_by: string | null
          series_title: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          chapter_urls?: string[] | null
          cover_url?: string | null
          created_at?: string
          description: string
          email: string
          genre: string
          id?: string
          name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          series_title: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          chapter_urls?: string[] | null
          cover_url?: string | null
          created_at?: string
          description?: string
          email?: string
          genre?: string
          id?: string
          name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          series_title?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          attachment_urls: string[] | null
          category: string
          created_at: string
          id: string
          is_creator_priority: boolean
          message: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_urls?: string[] | null
          category?: string
          created_at?: string
          id?: string
          is_creator_priority?: boolean
          message: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_urls?: string[] | null
          category?: string
          created_at?: string
          id?: string
          is_creator_priority?: boolean
          message?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_replies: {
        Row: {
          attachment_url: string | null
          created_at: string
          id: string
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bans: {
        Row: {
          banned_by: string
          created_at: string
          expires_at: string | null
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          banned_by: string
          created_at?: string
          expires_at?: string | null
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          banned_by?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_encryption_keys: {
        Row: {
          created_at: string
          id: string
          public_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          public_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          public_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          likes_count: number
          slug: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          likes_count?: number
          slug: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          likes_count?: number
          slug?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          hide_activity: boolean | null
          id: string
          incognito_mode: boolean | null
          notify_new_chapters: boolean | null
          notify_new_episodes: boolean | null
          notify_season_announcements: boolean | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hide_activity?: boolean | null
          id?: string
          incognito_mode?: boolean | null
          notify_new_chapters?: boolean | null
          notify_new_episodes?: boolean | null
          notify_season_announcements?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hide_activity?: boolean | null
          id?: string
          incognito_mode?: boolean | null
          notify_new_chapters?: boolean | null
          notify_new_episodes?: boolean | null
          notify_season_announcements?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reputation: {
        Row: {
          comments_count: number
          created_at: string
          helpful_votes: number
          id: string
          karma: number
          posts_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          created_at?: string
          helpful_votes?: number
          id?: string
          karma?: number
          posts_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          created_at?: string
          helpful_votes?: number
          id?: string
          karma?: number
          posts_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      viewing_history: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          last_chapter: number | null
          last_episode: number | null
          media_id: number
          media_type: string
          title: string
          title_japanese: string | null
          user_id: string
          viewed_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          last_chapter?: number | null
          last_episode?: number | null
          media_id: number
          media_type?: string
          title: string
          title_japanese?: string | null
          user_id: string
          viewed_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          last_chapter?: number | null
          last_episode?: number | null
          media_id?: number
          media_type?: string
          title?: string
          title_japanese?: string | null
          user_id?: string
          viewed_at?: string
        }
        Relationships: []
      }
      watch_parties: {
        Row: {
          anime_id: number
          anime_image: string | null
          anime_title: string
          created_at: string
          current_episode: number
          host_id: string
          id: string
          share_code: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          anime_id: number
          anime_image?: string | null
          anime_title: string
          created_at?: string
          current_episode?: number
          host_id: string
          id?: string
          share_code?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          anime_id?: number
          anime_image?: string | null
          anime_title?: string
          created_at?: string
          current_episode?: number
          host_id?: string
          id?: string
          share_code?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      watch_party_members: {
        Row: {
          id: string
          joined_at: string
          party_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          party_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          party_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_party_members_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "watch_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_party_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          party_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          party_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          party_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_party_messages_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "watch_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist: {
        Row: {
          category: string | null
          chapters_read: number | null
          created_at: string
          episodes_watched: number | null
          id: string
          image_url: string | null
          last_chapter_read: number | null
          last_episode_watched: number | null
          mal_id: number
          media_type: string
          notes: string | null
          score: number | null
          status: string | null
          title: string
          title_japanese: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          chapters_read?: number | null
          created_at?: string
          episodes_watched?: number | null
          id?: string
          image_url?: string | null
          last_chapter_read?: number | null
          last_episode_watched?: number | null
          mal_id: number
          media_type: string
          notes?: string | null
          score?: number | null
          status?: string | null
          title: string
          title_japanese?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          chapters_read?: number | null
          created_at?: string
          episodes_watched?: number | null
          id?: string
          image_url?: string | null
          last_chapter_read?: number | null
          last_episode_watched?: number | null
          mal_id?: number
          media_type?: string
          notes?: string | null
          score?: number | null
          status?: string | null
          title?: string
          title_japanese?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
