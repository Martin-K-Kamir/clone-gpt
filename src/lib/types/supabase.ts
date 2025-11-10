export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "12.2.3 (519615d)";
    };
    graphql_public: {
        Tables: {
            [_ in never]: never;
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            graphql: {
                Args: {
                    extensions?: Json;
                    operationName?: string;
                    query?: string;
                    variables?: Json;
                };
                Returns: Json;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
    public: {
        Tables: {
            chats: {
                Row: {
                    createdAt: string;
                    id: string;
                    title: string;
                    updatedAt: string;
                    userId: string;
                    visibility: Database["public"]["Enums"]["chatVisibility"];
                    visibleAt: string;
                };
                Insert: {
                    createdAt?: string;
                    id?: string;
                    title: string;
                    updatedAt: string;
                    userId: string;
                    visibility?: Database["public"]["Enums"]["chatVisibility"];
                    visibleAt?: string;
                };
                Update: {
                    createdAt?: string;
                    id?: string;
                    title?: string;
                    updatedAt?: string;
                    userId?: string;
                    visibility?: Database["public"]["Enums"]["chatVisibility"];
                    visibleAt?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "chats_userId_fkey";
                        columns: ["userId"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            messages: {
                Row: {
                    chatId: string;
                    content: string;
                    createdAt: string;
                    id: string;
                    metadata: Json;
                    parts: Json[];
                    role: Database["public"]["Enums"]["messageRole"];
                    userId: string;
                };
                Insert: {
                    chatId?: string;
                    content?: string;
                    createdAt?: string;
                    id?: string;
                    metadata: Json;
                    parts: Json[];
                    role: Database["public"]["Enums"]["messageRole"];
                    userId?: string;
                };
                Update: {
                    chatId?: string;
                    content?: string;
                    createdAt?: string;
                    id?: string;
                    metadata?: Json;
                    parts?: Json[];
                    role?: Database["public"]["Enums"]["messageRole"];
                    userId?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "messages_chatId_fkey";
                        columns: ["chatId"];
                        isOneToOne: false;
                        referencedRelation: "chats";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "messages_userId_fkey";
                        columns: ["userId"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            user_files_rate_limits: {
                Row: {
                    createdAt: string;
                    filesCounter: number;
                    id: string;
                    isOverLimit: boolean;
                    periodEnd: string | null;
                    periodStart: string | null;
                    updatedAt: string;
                    userId: string;
                };
                Insert: {
                    createdAt?: string;
                    filesCounter?: number;
                    id?: string;
                    isOverLimit?: boolean;
                    periodEnd?: string | null;
                    periodStart?: string | null;
                    updatedAt?: string;
                    userId: string;
                };
                Update: {
                    createdAt?: string;
                    filesCounter?: number;
                    id?: string;
                    isOverLimit?: boolean;
                    periodEnd?: string | null;
                    periodStart?: string | null;
                    updatedAt?: string;
                    userId?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "user_files_rate_limits_userId_fkey";
                        columns: ["userId"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            user_messages_rate_limits: {
                Row: {
                    createdAt: string;
                    id: string;
                    isOverLimit: boolean;
                    messagesCounter: number;
                    periodEnd: string | null;
                    periodStart: string | null;
                    tokensCounter: number;
                    updatedAt: string;
                    userId: string;
                };
                Insert: {
                    createdAt?: string;
                    id?: string;
                    isOverLimit?: boolean;
                    messagesCounter?: number;
                    periodEnd?: string | null;
                    periodStart?: string | null;
                    tokensCounter?: number;
                    updatedAt?: string;
                    userId: string;
                };
                Update: {
                    createdAt?: string;
                    id?: string;
                    isOverLimit?: boolean;
                    messagesCounter?: number;
                    periodEnd?: string | null;
                    periodStart?: string | null;
                    tokensCounter?: number;
                    updatedAt?: string;
                    userId?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "user_usages_userId_fkey";
                        columns: ["userId"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            user_preferences: {
                Row: {
                    characteristics: string | null;
                    createdAt: string;
                    extraInfo: string | null;
                    id: string;
                    nickname: string | null;
                    personality: Database["public"]["Enums"]["aiPersonality"];
                    role: string | null;
                    userId: string;
                };
                Insert: {
                    characteristics?: string | null;
                    createdAt?: string;
                    extraInfo?: string | null;
                    id?: string;
                    nickname?: string | null;
                    personality?: Database["public"]["Enums"]["aiPersonality"];
                    role?: string | null;
                    userId: string;
                };
                Update: {
                    characteristics?: string | null;
                    createdAt?: string;
                    extraInfo?: string | null;
                    id?: string;
                    nickname?: string | null;
                    personality?: Database["public"]["Enums"]["aiPersonality"];
                    role?: string | null;
                    userId?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "user_preferences_userId_fkey";
                        columns: ["userId"];
                        isOneToOne: true;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            users: {
                Row: {
                    createdAt: string;
                    email: string;
                    id: string;
                    image: string | null;
                    name: string;
                    password: string | null;
                    role: Database["public"]["Enums"]["userRole"];
                };
                Insert: {
                    createdAt?: string;
                    email: string;
                    id?: string;
                    image?: string | null;
                    name: string;
                    password?: string | null;
                    role?: Database["public"]["Enums"]["userRole"];
                };
                Update: {
                    createdAt?: string;
                    email?: string;
                    id?: string;
                    image?: string | null;
                    name?: string;
                    password?: string | null;
                    role?: Database["public"]["Enums"]["userRole"];
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            aiPersonality:
                | "FRIENDLY"
                | "CYNICAL"
                | "ROBOT"
                | "LISTENER"
                | "NERD"
                | "YODA"
                | "PROFESSIONAL"
                | "SILLY";
            chatVisibility: "private" | "public";
            messageRole: "assistant" | "user";
            userRole: "guest" | "user" | "admin";
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
    keyof Database,
    "public"
>];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
            DefaultSchema["Views"])
      ? (DefaultSchema["Tables"] &
            DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        | keyof DefaultSchema["Enums"]
        | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
      ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema["CompositeTypes"]
        | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
      ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    graphql_public: {
        Enums: {},
    },
    public: {
        Enums: {
            aiPersonality: [
                "FRIENDLY",
                "CYNICAL",
                "ROBOT",
                "LISTENER",
                "NERD",
                "YODA",
                "PROFESSIONAL",
                "SILLY",
            ],
            chatVisibility: ["private", "public"],
            messageRole: ["assistant", "user"],
            userRole: ["guest", "user", "admin"],
        },
    },
} as const;
