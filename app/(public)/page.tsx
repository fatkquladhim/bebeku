"use client";

import { MapPin, Phone, Mail, Clock, Award, Users, Egg, Calendar, ChevronRight, Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GallerySlider } from "@/components/gallery-slider";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

// Data peternakan - bisa diedit sesuai data Anda
const FARM_DATA = {
  name: "bebeku",
  tagline: "Kualitas Terbaik untuk Kesejahteraan Bersama",
  established: 2015,
  address: "Area Sawah/Kebun, Sananrejo, Kec. Turen, Kabupaten Malang, Jawa Timur 65175",
  phone: "+62 812-3456-7890",
  email: "info@bebeksejahtera.com",
  whatsapp: "+62 812-3456-7890",
  hours: "Senin - Sabtu: 07.00 - 17.00 WIB",
  capacity: 15000, // total kapasitas kandang
  activeBatches: 3,
  totalDucks: 12500,
  products: [
    { name: "Telur Bebek Segar", description: "Telur bebek segar harian, kualitas premium" },
    { name: "Daging Bebek", description: "Daging bebek segar dan beku, siap olah" },
    { name: "DOC (Day Old Chick)", description: "Anakan bebek sehat, vaksin lengkap" },
    { name: "Pupuk Organik", description: "Pupuk kandang berkualitas untuk pertanian" },
  ],
  certifications: [
    "Sertifikasi Halal MUI",
    "Sertifikat NKV (Nomor Kontrol Veteriner)",
    "ISO 22000:2018",
  ],
  achievements: [
    "Peternakan Terbaik Jawa Timur 2023",
    "Penghargaan Kualitas Telur Nasional 2022",
  ],
  // Ganti dengan foto-foto peternakan Anda
 gallery: [
  {
    src: "/images/farm-1.jpg",
    alt: "Kandang Bebek Modern",
    caption: "Kandang bebek modern dengan sistem ventilasi otomatis",
  },
  {
    src: "/images/farm-2.jpg",
    alt: "Koleksi Telur Segar",
    caption: "Hasil panen telur bebek segar setiap hari",
  },
  {
    src: "/images/farm-3.jpg",
    alt: "Anakan Bebek (DOC)",
    caption: "DOC berkualitas dengan vaksin lengkap",
  },
  {
    src: "/images/farm-4.jpg",
    alt: "Proses Pemberian Pakan",
    caption: "Pemberian pakan bernutrisi untuk pertumbuhan optimal",
  },
  {
    src: "/images/farm-5.jpg",
    alt: "Tim Peternak Profesional",
    caption: "Tim peternak profesional dan berpengalaman",
  },
  {
    src: "/images/farm-6.jpg",
    alt: "Pengemasan Telur Bebek",
    caption: "Proses pengemasan telur dengan standar kebersihan tinggi",
  },
  {
    src: "/images/farm-7.jpg",
    alt: "Distribusi Telur Bebek",
    caption: "Distribusi telur bebek ke mitra dan pelanggan",
  },
  {
    src: "/images/farm-8.jpg",
    alt: "Pemeriksaan Kualitas Telur",
    caption: "Pemeriksaan kualitas telur sebelum dipasarkan",
  },
  {
    src: "/images/farm-9.jpg",
    alt: "Area Penyimpanan Telur",
    caption: "Penyimpanan telur dengan suhu dan kebersihan terjaga",
  },
],
};

export default function LandingPage() {
  const yearsOfExperience = new Date().getFullYear() - FARM_DATA.established;
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Reset counter after 2 seconds of no clicks
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2000);

    // Navigate to login after 5 clicks
    if (newCount >= 5) {
      router.push("/peternak-masuk");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={handleLogoClick}
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Egg className="w-7 h-7 text-gray-800" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{FARM_DATA.name}</h1>
                <p className="text-xs text-gray-300">{FARM_DATA.tagline}</p>
              </div>
            </div>
            <a
              href={`https://wa.me/${FARM_DATA.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Hubungi Kami
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Award className="w-4 h-4" />
                {yearsOfExperience}+ Tahun Pengalaman
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Peternakan Bebek <span className="text-gray-700">Terpercaya</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Menyediakan telur bebek segar, daging bebek berkualitas, dan DOC sehat 
                dengan standar kesehatan dan kebersihan terbaik.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={`https://wa.me/${FARM_DATA.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Pesan Sekarang
                </a>
                <a
                  href="#produk"
                  className="inline-flex items-center gap-2 bg-white text-gray-800 border-2 border-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Lihat Produk
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl p-8 aspect-square flex items-center justify-center">
                <div className="text-center">
                  <Egg className="w-32 h-32 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium">Kualitas Terjamin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <Calendar className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">{yearsOfExperience}+</div>
              <div className="text-sm text-gray-600">Tahun Berdiri</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <Users className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">{FARM_DATA.capacity.toLocaleString("id-ID")}</div>
              <div className="text-sm text-gray-600">Kapasitas Kandang</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <Egg className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">{FARM_DATA.totalDucks.toLocaleString("id-ID")}</div>
              <div className="text-sm text-gray-600">Populasi Bebek</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <Award className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">{FARM_DATA.activeBatches}</div>
              <div className="text-sm text-gray-600">Batch Aktif</div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Camera className="w-4 h-4" />
              Galeri Peternakan
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Lihat Lebih Dekat Peternakan Kami</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Jelajahi fasilitas dan aktivitas peternakan kami melalui galeri foto berikut
            </p>
          </div>
          <GallerySlider 
            images={FARM_DATA.gallery} 
            autoPlay={true}
            interval={6000}
            showThumbnails={true}
          />
          <p className="text-center text-sm text-gray-500 mt-6">
            * Klik gambar untuk melihat fullscreen. Gunakan tombol panah atau swipe untuk navigasi.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section id="produk" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Produk Kami</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami menyediakan berbagai produk peternakan berkualitas untuk memenuhi kebutuhan Anda
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FARM_DATA.products.map((product, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <Egg className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sertifikasi & Penghargaan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Komitmen kami terhadap kualitas dan keamanan pangan telah diakui melalui berbagai sertifikasi
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-gray-700" />
                Sertifikasi
              </h3>
              <ul className="space-y-3">
                {FARM_DATA.certifications.map((cert, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mt-2" />
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-100 p-6 rounded-2xl">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-gray-700" />
                Penghargaan
              </h3>
              <ul className="space-y-3">
                {FARM_DATA.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mt-2" />
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Hubungi Kami</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Tertarik dengan produk kami? Hubungi kami untuk informasi lebih lanjut atau pemesanan
            </p>
          </div>
          
          {/* Map Section */}
          <div className="mb-12 max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
              <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.4877083481533!2d112.73159567358707!3d-8.153517181672624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd623929941fa1b%3A0xd67971f2bdd8d5ac!2sIstana%20bebek!5e0!3m2!1sen!2sid!4v1770076778404!5m2!1sen!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-xl"
                  title="Lokasi Peternakan Bebek Sejahtera"
                />
              </div>
              <div className="mt-4 flex items-start gap-3 text-gray-200">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-1">Lokasi Peternakan</p>
                  <p className="text-sm text-gray-300">{FARM_DATA.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
              <MapPin className="w-8 h-8 mb-4" />
              <h3 className="font-semibold mb-2">Alamat</h3>
              <p className="text-sm text-gray-300">{FARM_DATA.address}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
              <Phone className="w-8 h-8 mb-4" />
              <h3 className="font-semibold mb-2">Telepon</h3>
              <p className="text-sm text-gray-300">{FARM_DATA.phone}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
              <Mail className="w-8 h-8 mb-4" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-sm text-gray-300">{FARM_DATA.email}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
              <Clock className="w-8 h-8 mb-4" />
              <h3 className="font-semibold mb-2">Jam Operasional</h3>
              <p className="text-sm text-gray-300">{FARM_DATA.hours}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Egg className="w-5 h-5" />
              <span className="font-medium text-white">{FARM_DATA.name}</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} {FARM_DATA.name}. All rights reserved.
            </p>
            {/* Hidden admin link - very subtle */}
            <Link
              href="/peternak-masuk"
              className="text-xs text-gray-700 hover:text-gray-600 transition-colors"
              title="Admin Access"
            >
              •
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
