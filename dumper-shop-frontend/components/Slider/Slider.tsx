'use client';

import { IconArrowRight, IconShoppingBag, IconStar, IconTruck } from '@tabler/icons-react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Box, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { CustomLink } from '../Link/Link';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const slides = [
  {
    title: 'Premium Electronics Collection',
    subtitle: 'Discover the latest in technology',
    description:
      'Explore our curated selection of premium electronics with cutting-edge features and exceptional performance.',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=600&fit=crop',
    ctaText: 'Shop Electronics',
    ctaLink: '/products?category=electronics',
    color: 'purple',
  },
  {
    title: 'Fashion Forward',
    subtitle: 'Elevate your style',
    description:
      'From casual wear to formal attire, find your perfect look with our trendy and timeless fashion pieces.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop',
    ctaText: 'Explore Fashion',
    ctaLink: '/products?category=fashion',
    color: 'pink',
  },
  {
    title: 'Home & Garden Essentials',
    subtitle: 'Transform your space',
    description:
      'Create the perfect environment with our premium home and garden products designed for comfort and style.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=600&fit=crop',
    ctaText: 'Shop Home & Garden',
    ctaLink: '/products?category=home',
    color: 'green',
  },
  {
    title: 'Sports & Fitness Gear',
    subtitle: 'Achieve your goals',
    description:
      'Equip yourself with top-quality sports and fitness gear to reach new heights in your athletic journey.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop',
    ctaText: 'Get Active',
    ctaLink: '/products?category=sports',
    color: 'blue',
  },
];

export function Slider() {
  return (
    <Box
      h={{ base: 300, md: 500 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Swiper
        modules={[Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        style={{ height: '100%' }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                }}
              >
                <div
                  style={{
                    maxWidth: '600px',
                    color: 'white',
                    textAlign: 'center',
                    width: '100%',
                  }}
                  className="slide-content-mobile-desktop"
                >
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `
                      @media (max-width: 768px) {
                        .slide-content-mobile-desktop {
                          max-width: 300px !important;
                          text-align: left !important;
                        }
                        .slide-content-mobile-desktop .slide-buttons {
                          align-items: flex-start !important;
                        }
                        .slide-content-mobile-desktop .slide-features {
                          justify-content: flex-start !important;
                        }
                      }
                    `,
                    }}
                  />
                  {/* Desktop content */}
                  <div
                    style={{
                      display: 'block',
                      position: 'absolute',
                      left: '2rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      maxWidth: '500px',
                    }}
                    className="desktop-content"
                  >
                    <style
                      dangerouslySetInnerHTML={{
                        __html: `
                        @media (max-width: 768px) {
                          .desktop-content {
                            display: none !important;
                          }
                        }
                      `,
                      }}
                    />
                    <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                      <div
                        style={{
                          fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          opacity: 0.8,
                          marginBottom: '0.5rem',
                        }}
                      >
                        {slide.subtitle}
                      </div>
                      <h1
                        style={{
                          fontSize: 'clamp(1.5rem, 8vw, 4rem)',
                          fontWeight: '900',
                          margin: '0 0 1rem 0',
                          lineHeight: '1.1',
                        }}
                      >
                        {slide.title}
                      </h1>
                      <p
                        style={{
                          fontSize: 'clamp(0.9rem, 4vw, 1.25rem)',
                          opacity: 0.9,
                          margin: '0 0 1.5rem 0',
                          lineHeight: '1.6',
                        }}
                      >
                        {slide.description}
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        marginBottom: '2rem',
                      }}
                    >
                      <a
                        href={slide.ctaLink}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                          backgroundColor: slide.color,
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: '600',
                          fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          transition: 'transform 0.2s',
                        }}
                      >
                        {slide.ctaText}
                        <IconArrowRight size={16} />
                      </a>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: 'clamp(1rem, 3vw, 2rem)',
                        justifyContent: 'center',
                        opacity: 0.9,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <IconTruck size={20} />
                        <span
                          style={{ fontSize: 'clamp(0.7rem, 2vw, 0.875rem)', fontWeight: '500' }}
                        >
                          Free Shipping
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <IconStar size={20} />
                        <span
                          style={{ fontSize: 'clamp(0.7rem, 2vw, 0.875rem)', fontWeight: '500' }}
                        >
                          Premium Quality
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <IconShoppingBag size={20} />
                        <span
                          style={{ fontSize: 'clamp(0.7rem, 2vw, 0.875rem)', fontWeight: '500' }}
                        >
                          30-Day Returns
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile content - left aligned, simplified */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      bottom: '2rem',
                      maxWidth: '300px',
                      color: 'white',
                    }}
                    className="mobile-content"
                  >
                    <style
                      dangerouslySetInnerHTML={{
                        __html: `
                        .mobile-content {
                          display: none;
                        }
                        @media (max-width: 768px) {
                          .mobile-content {
                            display: block !important;
                          }
                        }
                      `,
                      }}
                    />
                    <h1
                      style={{
                        fontSize: '1.8rem',
                        fontWeight: '900',
                        margin: '0 0 0.5rem 0',
                        lineHeight: '1.2',
                      }}
                    >
                      {slide.title}
                    </h1>
                    <p
                      style={{
                        fontSize: '1rem',
                        opacity: 0.9,
                        margin: '0 0 1.5rem 0',
                        lineHeight: '1.5',
                      }}
                    >
                      {slide.description}
                    </p>
                    <a
                      href={slide.ctaLink}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: slide.color,
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '0.375rem',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      {slide.ctaText}
                      <IconArrowRight size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
