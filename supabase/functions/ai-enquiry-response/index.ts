import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { enquiryId, customerName, customerEmail, serviceType, message } = await req.json();

    if (!enquiryId || !customerEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get OpenAI API key from secrets
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      console.log("OpenAI API key not configured - skipping AI response");
      return new Response(
        JSON.stringify({ 
          success: true, 
          aiResponse: null,
          message: "AI auto-response not configured. Please add OPENAI_API_KEY secret."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate AI response using OpenAI
    const aiPrompt = `You are a friendly customer service representative for Harding Homes, a professional building company in Berkshire, UK.

A potential customer has just submitted an enquiry:
- Name: ${customerName}
- Service Type: ${serviceType}
- Message: ${message}

Write a warm, professional email response that:
1. Thanks them for their enquiry
2. Confirms we received their request for ${serviceType}
3. Lets them know we'll be in touch within 24 hours
4. Mentions our expertise in Berkshire area
5. Keeps it brief (3-4 short paragraphs)

Sign off as "The Harding Homes Team"`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a professional customer service representative for a building company." },
          { role: "user", content: aiPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      console.error("OpenAI API error:", await openaiResponse.text());
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "AI service temporarily unavailable" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const aiData = await openaiResponse.json();
    const aiMessage = aiData.choices[0]?.message?.content || "";

    // Store the AI response in database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { error: updateError } = await supabase
      .from("public_enquiries")
      .update({ 
        ai_response: aiMessage,
        ai_responded_at: new Date().toISOString()
      })
      .eq("id", enquiryId);

    if (updateError) {
      console.error("Database update error:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        aiResponse: aiMessage,
        customerEmail,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});