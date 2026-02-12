'use client';

import { useEffect, useState } from 'react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Card, Stack, Text } from '@mantine/core';
import { sdk } from '../../stores/lib/sdk';
import {
  IconDeviceMobile,
  IconHome,
  IconTrophy,
  IconBooks,
  IconBrush,
  IconShirt,
  IconShoe,
  IconMilk,
  IconCar,
  IconBabyCarriage,
  IconTools,
  IconShoppingBag,
} from '@tabler/icons-react';

import 'swiper/css';
import 'swiper/css/pagination';

import { CustomLink } from '../Link/Link';

const DEFAULT_CATEGORIES = [
  {
    name: 'Electronics',
    IconComponent: IconDeviceMobile,
    href: '/products?category=electronics',
    description: 'Latest gadgets & tech',
  },
  {
    name: 'Fashion',
    IconComponent: IconShoppingBag,
    href: '/products?category=fashion',
    description: 'Trendy clothing & accessories',
  },
  {
    name: 'Home & Garden',
    IconComponent: IconHome,
    href: '/products?category=home',
    description: 'Home essentials & decor',
  },
  {
    name: 'Sports',
    IconComponent: IconTrophy,
    href: '/products?category=sports',
    description: 'Fitness & outdoor gear',
  },
  {
    name: 'Books',
    IconComponent: IconBooks,
    href: '/products?category=books',
    description: 'Knowledge & learning',
  },
  {
    name: 'Beauty',
    IconComponent: IconBrush,
    href: '/products?category=beauty',
    description: 'Skincare & cosmetics',
  },
];

function getIconForCategory(name: string) {
  const n = (name || '').toLowerCase();
  if (n.includes('elect')) return IconDeviceMobile;
  if (n.includes('fashion') || n.includes('clothes') || n.includes('apparel')) return IconShoppingBag;
  if (n.includes('pants') || n.includes('jeans') || n.includes('trousers')) return IconShoppingBag;
  if (n.includes('shirt') || n.includes('top') || n.includes('blouse')) return IconShirt;
  if (n.includes('shoe') || n.includes('footwear') || n.includes('sneaker')) return IconShoe;
  if (n.includes('home') || n.includes('garden') || n.includes('furn')) return IconHome;
  if (n.includes('sport') || n.includes('fitness') || n.includes('outdoor')) return IconTrophy;
  if (n.includes('book') || n.includes('books') || n.includes('liter')) return IconBooks;
  if (n.includes('beaut') || n.includes('cosmet')) return IconBrush;
  if (n.includes('kid') || n.includes('toy')) return IconBabyCarriage;
  if (n.includes('food') || n.includes('grocer') || n.includes('beverage')) return IconMilk;
  if (n.includes('car') || n.includes('auto') || n.includes('vehicle')) return IconCar;
  if (n.includes('tool') || n.includes('hardware') || n.includes('diy')) return IconTools;
  return IconShoppingBag;
}

export function ScrollingCategories() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const res = (await sdk.client.fetch('/store/product-categories')) as any;
        const cats = res?.product_categories || [];
        if (!isMounted || cats.length === 0) return;

        const mapped = cats.map((c: any) => ({
          id: c.id,
          name: c.name || c.title || c.handle || 'Category',
          IconComponent: getIconForCategory(c.handle || c.name || c.title),
          href: `/products?category=${c.handle || c.id}`,
          description: c.description || c.metadata?.description || '',
        }));

        setCategories(mapped);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Create duplicated categories for seamless infinite loop
  const duplicatedCategories = [...categories, ...categories, ...categories];

  return (
    <div style={{ marginTop: '2rem', display: 'block', overflow: 'hidden' }}>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={40}
        slidesPerView={4}
        centeredSlides={false}
        loop={true}
        loopAdditionalSlides={6}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
          reverseDirection: false,
          pauseOnMouseEnter: true,
        }}
        speed={1200}
        allowTouchMove={true}
        grabCursor={true}
        breakpoints={{
          320: {
            slidesPerView: 3,
            spaceBetween: 5,
          },
          640: {
            slidesPerView: 3,
            spaceBetween: 8,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 35,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 40,
          },
        }}
        style={
          {
            padding: '20px 0',
          } as any
        }
      >
        {duplicatedCategories.map((category, index) => (
          <SwiperSlide key={`${category.name}-${index}`}>
            <CustomLink href={category.href} style={{ textDecoration: 'none', display: 'block' }}>
              <Card
                padding="lg"
                radius={50}
                withBorder
                style={{
                  cursor: 'pointer',
                  width: 'var(--card-width, 260px)',
                  height: 'var(--card-height, 260px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '2px solid var(--mantine-color-purple-2)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                }}
                className="category-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.08) translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.borderColor = 'var(--mantine-color-purple-4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.borderColor = 'var(--mantine-color-purple-2)';
                }}
              >
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                    .category-card {
                      --card-width: 130px;
                      --card-height: 130px;
                      padding: 2rem 2.25rem !important;
                      border-radius: 8px !important;
                    
                    }
                    .category-card .mobile-icon {
                      font-size: 1.5rem !important;
                    }
                    .category-card .mobile-title {
                      font-size: 0.8rem !important;
                      font-weight: 600 !important;
                    }
                    .category-card .mobile-desc {
                      font-size: 0.65rem !important;
                      line-height: 1.2 !important;
                    }
                    @media (min-width: 768px) {
                      .category-card {
                        --card-width: 260px;
                        --card-height: 260px;
                        padding: 1.25rem !important;
                        border-radius: 50px !important;
                      }
                      .category-card .mobile-icon {
                        font-size: 2.5rem !important;
                      }
                      .category-card .mobile-title {
                        font-size: 1.125rem !important;
                        font-weight: 700 !important;
                      }
                      .category-card .mobile-desc {
                        font-size: 0.875rem !important;
                        line-height: 1.4 !important;
                      }
                    }
                  `,
                  }}
                />
                <Stack gap="xs" align="center">
                  <div
                    className="mobile-icon"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      animation: 'float 3s ease-in-out infinite',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {category.IconComponent && (
                      <category.IconComponent size={40} stroke={2} color="var(--mantine-color-purple-6)" />
                    )}
                  </div>
                  <Text className="mobile-title" c="dark" ta="center">
                    {category.name}
                  </Text>
                  <Text className="mobile-desc" c="dimmed" ta="center">
                    {category.description}
                  </Text>
                </Stack>
              </Card>
            </CustomLink>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
}
