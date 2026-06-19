
/*
# Add Ad Click Tracking Function

1. New Function
- `increment_ad_click(ad_id UUID)` - Increments the click_count of an ad by 1
- Called from frontend when users click on ads
2. Security
- SECURITY DEFINER - runs with elevated privileges so any user can trigger
*/

CREATE OR REPLACE FUNCTION public.increment_ad_click(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.ads SET click_count = click_count + 1 WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
