import { createClient } from "@supabase/supabase-js";

import { Database } from "@/lib/types";

const supabaseUrl =
    process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
