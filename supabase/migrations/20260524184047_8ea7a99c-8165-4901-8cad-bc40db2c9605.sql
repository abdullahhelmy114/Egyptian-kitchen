
CREATE TABLE public.dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('main','extra')),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.dish_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('saturday','sunday','monday','tuesday','wednesday','thursday','friday')),
  price INTEGER NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_dish_availability_day ON public.dish_availability(day_of_week);
CREATE INDEX idx_dish_availability_dish ON public.dish_availability(dish_id);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  order_date DATE NOT NULL,
  language TEXT NOT NULL DEFAULT 'ar',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_name ON public.orders(customer_name);
CREATE INDEX idx_orders_date ON public.orders(order_date);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES public.dishes(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);

ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dish_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dishes_read_all" ON public.dishes FOR SELECT USING (true);
CREATE POLICY "availability_read_all" ON public.dish_availability FOR SELECT USING (true);

CREATE POLICY "orders_read_all" ON public.orders FOR SELECT USING (true);
CREATE POLICY "orders_insert_all" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_all" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "orders_delete_all" ON public.orders FOR DELETE USING (true);

CREATE POLICY "order_items_read_all" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "order_items_insert_all" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_update_all" ON public.order_items FOR UPDATE USING (true);
CREATE POLICY "order_items_delete_all" ON public.order_items FOR DELETE USING (true);
