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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      "404_logs": {
        Row: {
          created_at: string | null
          first_seen_at: string | null
          hit_count: number | null
          id: string
          ip_address: string | null
          is_resolved: boolean | null
          last_seen_at: string | null
          path: string
          redirect_id: string | null
          referrer: string | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          first_seen_at?: string | null
          hit_count?: number | null
          id?: string
          ip_address?: string | null
          is_resolved?: boolean | null
          last_seen_at?: string | null
          path: string
          redirect_id?: string | null
          referrer?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          first_seen_at?: string | null
          hit_count?: number | null
          id?: string
          ip_address?: string | null
          is_resolved?: boolean | null
          last_seen_at?: string | null
          path?: string
          redirect_id?: string | null
          referrer?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "404_logs_redirect_id_fkey"
            columns: ["redirect_id"]
            isOneToOne: false
            referencedRelation: "redirects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chatbot_settings: {
        Row: {
          ai_model: string | null
          ai_provider: string | null
          anthropic_api_key_encrypted: string | null
          chatbot_mode: string | null
          created_at: string | null
          id: string
          mistral_api_key_encrypted: string | null
          openai_api_key_encrypted: string | null
          rag_enabled: boolean | null
          system_prompt: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ai_model?: string | null
          ai_provider?: string | null
          anthropic_api_key_encrypted?: string | null
          chatbot_mode?: string | null
          created_at?: string | null
          id?: string
          mistral_api_key_encrypted?: string | null
          openai_api_key_encrypted?: string | null
          rag_enabled?: boolean | null
          system_prompt?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ai_model?: string | null
          ai_provider?: string | null
          anthropic_api_key_encrypted?: string | null
          chatbot_mode?: string | null
          created_at?: string | null
          id?: string
          mistral_api_key_encrypted?: string | null
          openai_api_key_encrypted?: string | null
          rag_enabled?: boolean | null
          system_prompt?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      calculator_submissions: {
        Row: {
          address: string | null
          admin_notes: string | null
          aids_details: Json | null
          archived_at: string | null
          assigned_to: string | null
          calculation_data: Json
          contacted_at: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string
          estimated_cost: number | null
          id: string
          ip_address: string | null
          name: string
          phone: string | null
          project_type: string
          status: string | null
          surface: number | null
          total_aids: number | null
          updated_at: string | null
          user_agent: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          aids_details?: Json | null
          archived_at?: string | null
          assigned_to?: string | null
          calculation_data: Json
          contacted_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email: string
          estimated_cost?: number | null
          id?: string
          ip_address?: string | null
          name: string
          phone?: string | null
          project_type: string
          status?: string | null
          surface?: number | null
          total_aids?: number | null
          updated_at?: string | null
          user_agent?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          aids_details?: Json | null
          archived_at?: string | null
          assigned_to?: string | null
          calculation_data?: Json
          contacted_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string
          estimated_cost?: number | null
          id?: string
          ip_address?: string | null
          name?: string
          phone?: string | null
          project_type?: string
          status?: string | null
          surface?: number | null
          total_aids?: number | null
          updated_at?: string | null
          user_agent?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      certifications: {
        Row: {
          benefits: string[] | null
          category: string
          category_color: string
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string
          display_order: number
          id: string
          logo_url: string | null
          name: string
          published: boolean | null
          updated_at: string | null
        }
        Insert: {
          benefits?: string[] | null
          category: string
          category_color: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description: string
          display_order?: number
          id?: string
          logo_url?: string | null
          name: string
          published?: boolean | null
          updated_at?: string | null
        }
        Update: {
          benefits?: string[] | null
          category?: string
          category_color?: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string
          display_order?: number
          id?: string
          logo_url?: string | null
          name?: string
          published?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          admin_notes: string | null
          archived_at: string | null
          assigned_to: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string
          id: string
          ip_address: string | null
          message: string
          name: string
          phone: string | null
          priority: string | null
          replied_at: string | null
          source: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          admin_notes?: string | null
          archived_at?: string | null
          assigned_to?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email: string
          id?: string
          ip_address?: string | null
          message: string
          name: string
          phone?: string | null
          priority?: string | null
          replied_at?: string | null
          source?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          admin_notes?: string | null
          archived_at?: string | null
          assigned_to?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          message?: string
          name?: string
          phone?: string | null
          priority?: string | null
          replied_at?: string | null
          source?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      content_embeddings: {
        Row: {
          content_id: string
          content_text: string
          content_type: string
          created_at: string | null
          embedding: string
          id: string
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          content_id: string
          content_text: string
          content_type: string
          created_at?: string | null
          embedding: string
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          content_id?: string
          content_text?: string
          content_type?: string
          created_at?: string | null
          embedding?: string
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      detailed_quotes: {
        Row: {
          archived_at: string | null
          assigned_to: string | null
          attic_access: string | null
          budget_range: string | null
          carpentry_year: number | null
          constraints_details: string | null
          created_at: string | null
          deleted_at: string | null
          desired_materials: string | null
          discovery_source: string | null
          discovery_source_other: string | null
          email: string
          existing_insulation: string | null
          existing_tiles: string | null
          existing_zinguerie: string | null
          form_data: Json | null
          house_year: number | null
          id: string
          insulation_year: number | null
          is_read: boolean | null
          materials_reason: string | null
          name: string
          needs_aid_support: boolean | null
          notes: string | null
          objectives: string[]
          phone: string
          project_nature: string[]
          property_address: string
          regulatory_constraints: boolean | null
          requested_aids: string[]
          roof_year: number | null
          special_requests: string | null
          status: string | null
          timeline: string | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          assigned_to?: string | null
          attic_access?: string | null
          budget_range?: string | null
          carpentry_year?: number | null
          constraints_details?: string | null
          created_at?: string | null
          deleted_at?: string | null
          desired_materials?: string | null
          discovery_source?: string | null
          discovery_source_other?: string | null
          email: string
          existing_insulation?: string | null
          existing_tiles?: string | null
          existing_zinguerie?: string | null
          form_data?: Json | null
          house_year?: number | null
          id?: string
          insulation_year?: number | null
          is_read?: boolean | null
          materials_reason?: string | null
          name: string
          needs_aid_support?: boolean | null
          notes?: string | null
          objectives: string[]
          phone: string
          project_nature: string[]
          property_address: string
          regulatory_constraints?: boolean | null
          requested_aids: string[]
          roof_year?: number | null
          special_requests?: string | null
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          assigned_to?: string | null
          attic_access?: string | null
          budget_range?: string | null
          carpentry_year?: number | null
          constraints_details?: string | null
          created_at?: string | null
          deleted_at?: string | null
          desired_materials?: string | null
          discovery_source?: string | null
          discovery_source_other?: string | null
          email?: string
          existing_insulation?: string | null
          existing_tiles?: string | null
          existing_zinguerie?: string | null
          form_data?: Json | null
          house_year?: number | null
          id?: string
          insulation_year?: number | null
          is_read?: boolean | null
          materials_reason?: string | null
          name?: string
          needs_aid_support?: boolean | null
          notes?: string | null
          objectives?: string[]
          phone?: string
          project_nature?: string[]
          property_address?: string
          regulatory_constraints?: boolean | null
          requested_aids?: string[]
          roof_year?: number | null
          special_requests?: string | null
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          bounce_reason: string | null
          bounce_type: string | null
          bounced_at: string | null
          click_count: number | null
          clicked_at: string | null
          complained_at: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          delivered_at: string | null
          delivery_status: string | null
          error_code: string | null
          error_message: string | null
          from_email: string
          from_name: string | null
          html_content: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          open_count: number | null
          opened_at: string | null
          related_id: string | null
          related_type: string | null
          reply_to: string | null
          resend_id: string | null
          sent_at: string | null
          status: string | null
          subject: string
          tags: string[] | null
          text_content: string | null
          to_email: string
          to_name: string | null
          updated_at: string | null
          webhook_events: Json | null
        }
        Insert: {
          bounce_reason?: string | null
          bounce_type?: string | null
          bounced_at?: string | null
          click_count?: number | null
          clicked_at?: string | null
          complained_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          delivered_at?: string | null
          delivery_status?: string | null
          error_code?: string | null
          error_message?: string | null
          from_email: string
          from_name?: string | null
          html_content?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          open_count?: number | null
          opened_at?: string | null
          related_id?: string | null
          related_type?: string | null
          reply_to?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          tags?: string[] | null
          text_content?: string | null
          to_email: string
          to_name?: string | null
          updated_at?: string | null
          webhook_events?: Json | null
        }
        Update: {
          bounce_reason?: string | null
          bounce_type?: string | null
          bounced_at?: string | null
          click_count?: number | null
          clicked_at?: string | null
          complained_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          delivered_at?: string | null
          delivery_status?: string | null
          error_code?: string | null
          error_message?: string | null
          from_email?: string
          from_name?: string | null
          html_content?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          open_count?: number | null
          opened_at?: string | null
          related_id?: string | null
          related_type?: string | null
          reply_to?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          tags?: string[] | null
          text_content?: string | null
          to_email?: string
          to_name?: string | null
          updated_at?: string | null
          webhook_events?: Json | null
        }
        Relationships: []
      }
      faq_categories: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          display_order: number
          icon: string
          id: string
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number
          icon: string
          id?: string
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number
          icon?: string
          id?: string
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faq_questions: {
        Row: {
          answer: string
          category_id: string
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          display_order: number
          id: string
          published: boolean | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category_id: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number
          id?: string
          published?: boolean | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category_id?: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number
          id?: string
          published?: boolean | null
          question?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "faq_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      job_openings: {
        Row: {
          contract_type: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string
          id: string
          is_active: boolean | null
          location: string | null
          requirements: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          contract_type?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          requirements?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          contract_type?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          requirements?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lexique_terms: {
        Row: {
          created_at: string | null
          definition: string
          deleted_at: string | null
          deleted_by: string | null
          display_order: number
          id: string
          letter: string
          published: boolean | null
          term: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          definition: string
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number
          id?: string
          letter: string
          published?: boolean | null
          term: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          definition?: string
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number
          id?: string
          letter?: string
          published?: boolean | null
          term?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          canonical_url: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          display_order: number | null
          id: string
          is_dynamic: boolean | null
          keywords: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          og_type: string | null
          parent_path: string | null
          path: string
          robots: string | null
          structured_data: Json | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_dynamic?: boolean | null
          keywords?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          parent_path?: string | null
          path: string
          robots?: string | null
          structured_data?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_dynamic?: boolean | null
          keywords?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          parent_path?: string | null
          path?: string
          robots?: string | null
          structured_data?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      popups: {
        Row: {
          background_color: string | null
          border_radius: number | null
          button_color: string | null
          button_text_color: string | null
          click_count: number | null
          close_count: number | null
          created_at: string | null
          created_by: string | null
          cta_link: string | null
          cta_text: string | null
          deleted_at: string | null
          description: string | null
          end_date: string | null
          excluded_paths: string[] | null
          heading: string | null
          id: string
          image_url: string | null
          included_paths: string[] | null
          internal_name: string
          is_active: boolean | null
          overlay_color: string | null
          position: string | null
          scroll_percentage: number | null
          show_once_per_session: boolean | null
          show_once_per_user: boolean | null
          start_date: string | null
          text_color: string | null
          title: string
          trigger_delay: number | null
          trigger_type: string | null
          updated_at: string | null
          updated_by: string | null
          view_count: number | null
          width_px: number | null
        }
        Insert: {
          background_color?: string | null
          border_radius?: number | null
          button_color?: string | null
          button_text_color?: string | null
          click_count?: number | null
          close_count?: number | null
          created_at?: string | null
          created_by?: string | null
          cta_link?: string | null
          cta_text?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          excluded_paths?: string[] | null
          heading?: string | null
          id?: string
          image_url?: string | null
          included_paths?: string[] | null
          internal_name: string
          is_active?: boolean | null
          overlay_color?: string | null
          position?: string | null
          scroll_percentage?: number | null
          show_once_per_session?: boolean | null
          show_once_per_user?: boolean | null
          start_date?: string | null
          text_color?: string | null
          title: string
          trigger_delay?: number | null
          trigger_type?: string | null
          updated_at?: string | null
          updated_by?: string | null
          view_count?: number | null
          width_px?: number | null
        }
        Update: {
          background_color?: string | null
          border_radius?: number | null
          button_color?: string | null
          button_text_color?: string | null
          click_count?: number | null
          close_count?: number | null
          created_at?: string | null
          created_by?: string | null
          cta_link?: string | null
          cta_text?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          excluded_paths?: string[] | null
          heading?: string | null
          id?: string
          image_url?: string | null
          included_paths?: string[] | null
          internal_name?: string
          is_active?: boolean | null
          overlay_color?: string | null
          position?: string | null
          scroll_percentage?: number | null
          show_once_per_session?: boolean | null
          show_once_per_user?: boolean | null
          start_date?: string | null
          text_color?: string | null
          title?: string
          trigger_delay?: number | null
          trigger_type?: string | null
          updated_at?: string | null
          updated_by?: string | null
          view_count?: number | null
          width_px?: number | null
        }
        Relationships: []
      }
      project_categories: {
        Row: {
          category_id: string
          project_id: string
        }
        Insert: {
          category_id: string
          project_id: string
        }
        Update: {
          category_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_categories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_images: {
        Row: {
          alt: string | null
          caption: string | null
          created_at: string | null
          id: string
          order_index: number | null
          project_id: string | null
          type: string | null
          url: string
        }
        Insert: {
          alt?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          order_index?: number | null
          project_id?: string | null
          type?: string | null
          url: string
        }
        Update: {
          alt?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          order_index?: number | null
          project_id?: string | null
          type?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          date: string
          deleted_at: string | null
          deleted_by: string | null
          description: string
          duration: string | null
          featured: boolean | null
          gallery_layout: string | null
          id: string
          location: string
          main_image: string | null
          materials: string[] | null
          published: boolean | null
          slug: string | null
          subtitle: string | null
          technical_details: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          deleted_at?: string | null
          deleted_by?: string | null
          description: string
          duration?: string | null
          featured?: boolean | null
          gallery_layout?: string | null
          id?: string
          location: string
          main_image?: string | null
          materials?: string[] | null
          published?: boolean | null
          slug?: string | null
          subtitle?: string | null
          technical_details?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string
          duration?: string | null
          featured?: boolean | null
          gallery_layout?: string | null
          id?: string
          location?: string
          main_image?: string | null
          materials?: string[] | null
          published?: boolean | null
          slug?: string | null
          subtitle?: string | null
          technical_details?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          additional_info: Json | null
          address: string | null
          admin_notes: string | null
          archived_at: string | null
          assigned_to: string | null
          city: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string
          estimated_budget: string | null
          id: string
          ip_address: string | null
          name: string
          phone: string
          photos: string[] | null
          preferred_date: string | null
          project_description: string
          quote_amount: number | null
          quote_pdf_url: string | null
          quote_sent_at: string | null
          service_type: string
          source: string | null
          status: string | null
          surface: number | null
          updated_at: string | null
          urgency: string | null
          user_agent: string | null
          zip_code: string | null
        }
        Insert: {
          additional_info?: Json | null
          address?: string | null
          admin_notes?: string | null
          archived_at?: string | null
          assigned_to?: string | null
          city?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email: string
          estimated_budget?: string | null
          id?: string
          ip_address?: string | null
          name: string
          phone: string
          photos?: string[] | null
          preferred_date?: string | null
          project_description: string
          quote_amount?: number | null
          quote_pdf_url?: string | null
          quote_sent_at?: string | null
          service_type: string
          source?: string | null
          status?: string | null
          surface?: number | null
          updated_at?: string | null
          urgency?: string | null
          user_agent?: string | null
          zip_code?: string | null
        }
        Update: {
          additional_info?: Json | null
          address?: string | null
          admin_notes?: string | null
          archived_at?: string | null
          assigned_to?: string | null
          city?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string
          estimated_budget?: string | null
          id?: string
          ip_address?: string | null
          name?: string
          phone?: string
          photos?: string[] | null
          preferred_date?: string | null
          project_description?: string
          quote_amount?: number | null
          quote_pdf_url?: string | null
          quote_sent_at?: string | null
          service_type?: string
          source?: string | null
          status?: string | null
          surface?: number | null
          updated_at?: string | null
          urgency?: string | null
          user_agent?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      redirects: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          from_path: string
          hit_count: number | null
          id: string
          is_active: boolean | null
          last_hit_at: string | null
          notes: string | null
          status_code: number | null
          to_path: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          from_path: string
          hit_count?: number | null
          id?: string
          is_active?: boolean | null
          last_hit_at?: string | null
          notes?: string | null
          status_code?: number | null
          to_path: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          from_path?: string
          hit_count?: number | null
          id?: string
          is_active?: boolean | null
          last_hit_at?: string | null
          notes?: string | null
          status_code?: number | null
          to_path?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          display_order: number | null
          id: string
          is_published: boolean | null
          name: string
          photo_url: string | null
          position: string
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          name: string
          photo_url?: string | null
          position: string
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          name?: string
          photo_url?: string | null
          position?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource: string
          resource_id: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource: string
          resource_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource?: string
          resource_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          last_login: string | null
          name: string | null
          roles: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id: string
          last_login?: string | null
          name?: string | null
          roles?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          last_login?: string | null
          name?: string | null
          roles?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      detailed_quotes_stats: {
        Row: {
          archived_count: number | null
          converted_count: number | null
          deleted_count: number | null
          in_progress_count: number | null
          new_count: number | null
          quoted_count: number | null
          this_month_count: number | null
          this_week_count: number | null
          total: number | null
          unread_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      archive_detailed_quote: { Args: { quote_id: string }; Returns: boolean }
      check_api_key_exists: {
        Args: { provider_name: string }
        Returns: boolean
      }
      cleanup_old_404_logs: { Args: never; Returns: number }
      decrypt_api_key: {
        Args: { encrypted_key: string; secret: string }
        Returns: string
      }
      encrypt_api_key: {
        Args: { key: string; secret: string }
        Returns: string
      }
      get_analytics_settings: { Args: never; Returns: Json }
      get_detailed_quotes_stats: {
        Args: never
        Returns: {
          archived_count: number
          converted_count: number
          deleted_count: number
          in_progress_count: number
          new_count: number
          quoted_count: number
          this_month_count: number
          this_week_count: number
          total: number
          unread_count: number
        }[]
      }
      get_embeddings_stats: {
        Args: never
        Returns: {
          content_type: string
          count: number
          last_updated: string
        }[]
      }
      get_features_settings: { Args: never; Returns: Json }
      get_general_settings: { Args: never; Returns: Json }
      get_my_roles: { Args: never; Returns: string[] }
      get_seo_settings: { Args: never; Returns: Json }
      get_setting: { Args: { setting_key: string }; Returns: Json }
      get_unread_detailed_quotes_count: { Args: never; Returns: number }
      get_user_roles: { Args: { user_id: string }; Returns: Json }
      has_any_role: { Args: { role_names: string[] }; Returns: boolean }
      has_role:
        | { Args: { role_name: string }; Returns: boolean }
        | { Args: { required_role: string; user_id: string }; Returns: boolean }
      increment_popup_click: { Args: { popup_id: string }; Returns: undefined }
      increment_popup_close: { Args: { popup_id: string }; Returns: undefined }
      increment_popup_view: { Args: { popup_id: string }; Returns: undefined }
      increment_redirect_hit: {
        Args: { redirect_id: string }
        Returns: undefined
      }
      is_active_user: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_instructor: { Args: never; Returns: boolean }
      is_maintenance_mode: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      log_404: {
        Args: {
          p_ip_address?: string
          p_path: string
          p_referrer?: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      log_user_activity: {
        Args: {
          p_action: string
          p_details?: Json
          p_ip_address?: string
          p_resource: string
          p_resource_id?: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: undefined
      }
      owns_instructor: { Args: { instructor_id: string }; Returns: boolean }
      resolve_404: {
        Args: { p_path: string; p_redirect_id: string }
        Returns: undefined
      }
      search_content_embeddings: {
        Args: {
          filter_content_type?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content_id: string
          content_text: string
          content_type: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      unarchive_detailed_quote: { Args: { quote_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
