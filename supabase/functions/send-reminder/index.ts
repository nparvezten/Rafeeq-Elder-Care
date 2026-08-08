/*
========================================================================
Supabase Edge Function: send-reminder
========================================================================

MANUAL DEPLOYMENT STEPS (DO NOT ATTEMPT AUTO-DEPLOYMENT):
------------------------------------------------------------------------
1. Install Supabase CLI:
   npm install -g supabase

2. Login to your Supabase Account:
   supabase login

3. Link to your active Supabase project:
   supabase link --project-ref nzppxhrbtgmxfuhfkgcm

4. Set VAPID Secrets (generate VAPID keys using `npx web-push generate-vapid-keys`):
   supabase secrets set VAPID_PUBLIC_KEY="YOUR_PUBLIC_VAPID_KEY"
   supabase secrets set VAPID_PRIVATE_KEY="YOUR_PRIVATE_VAPID_KEY"
   supabase secrets set VAPID_SUBJECT="mailto:care@rafeeq.app"

5. Deploy Function:
   supabase functions deploy send-reminder --no-verify-jwt

6. Optional (Configure Cron Trigger):
   To trigger reminders on a schedule (e.g. daily at 8:00 AM), add a Pg_cron job in Supabase:
   SELECT cron.schedule('daily-care-reminder', '0 8 * * *', $$
     SELECT net.http_post(
       url:='https://nzppxhrbtgmxfuhfkgcm.supabase.co/functions/v1/send-reminder',
       headers:='{"Content-Type": "application/json"}'::jsonb,
       body:='{"message": "Time for your daily family care review and gratitude reflection."}'::jsonb
     );
   $$);
========================================================================
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:care@rafeeq.app';

    const { message = 'Time for your daily family care review and reflection.', title = 'Rafeeq Care Reminder' } = await req.json();

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) {
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, count: 0, message: 'No active push subscriptions found.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/favicon.ico',
      data: { url: '/#/gratitude' }
    });

    let sentCount = 0;
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: sub.keys
        }, payload);
        sentCount++;
      } catch (err) {
        console.warn(`Failed push to ${sub.endpoint}:`, err);
      }
    });

    await Promise.all(sendPromises);

    return new Response(
      JSON.stringify({ success: true, sentCount, totalSubscriptions: subscriptions.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
