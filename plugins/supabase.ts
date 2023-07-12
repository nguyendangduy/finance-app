import { createClient } from "@supabase/supabase-js";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const supabase = createClient(
    `${config.public.supabase.url}`,
    `${config.public.supabase.key}`,
    {
      auth: {
        persistSession: false,
      },
    }
  );
  
  return {
    provide : {
      supabase
    }
  }
});
