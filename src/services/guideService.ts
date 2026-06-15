import apiClient from "./apiClient";
import { ApiResponse } from "../types/auth";
import { GuideData } from "../types/guide";

const ownerMockGuideEN: GuideData = {
  title: "User Guide",
  subtitle: "Complete guide to getting started, managing, and maximizing the GSTC self-assessment platform.",
  welcomeTitle: "Welcome to the GSTC Self-Assessment Platform!",
  welcomeText1: "This platform is designed to guide tourism destinations in Indonesia through the compliance evaluation process with the Global Sustainable Tourism Council (GSTC) Destination Criteria.",
  welcomeText2: "Use this platform as a collaborative workspace between you as the Destination Manager and Expert Consultants to collect evidence, receive feedback, and achieve world-class sustainable tourism standards.",
  gettingStartedTitle: "Getting Started with Compliance",
  steps: [
    {
      number: 1,
      title: "Understand the Main Dashboard",
      content: "The \"Home\" page is your monitoring center. Here you'll see the compliance progress summary for each GSTC pillar (A, B, C, D), focus areas that need priority improvement, and your account status (Premium/Trial/Basic) in the profile section."
    },
    {
      number: 2,
      title: "Navigate to Standard Compliance",
      content: "Click the \"Standard Compliance\" menu. Here you'll find the four main pillars of the GSTC Destination Criteria. Select a pillar (for example, PILLAR A: Sustainable Management) to view detailed criteria within it.",
      showPillBadges: true
    },
    {
      number: 3,
      title: "Upload Compliance Evidence",
      content: "For each criterion, there are several indicators to fulfill. Click the \"Link Evidence\" button on each indicator to upload compliance evidence as links (example: Google Drive, Dropbox, or public documents).",
      subPoints: [
        "**Save as Draft**: Use this option if you're not ready to submit evidence for review. Status will become 'In Progress'.",
        "**Submit for Review**: If evidence is complete and ready, submit for consultant review. Status will change to 'In Review', and you cannot modify it until the review process is complete."
      ]
    }
  ],
  interactionTitle: "Interacting with Consultant",
  interactionText1: "Each criterion has a 'Discussion' feature. Use this to communicate directly with expert consultants. You can ask questions, request clarification, or provide additional context about uploaded evidence.",
  interactionText2: "After the consultant reviews your evidence, the status will change to 'Done' (Approved), 'Rejected', or 'Revision' (Needs Revision). Check consultant comments for follow-up.",
  otherFeaturesTitle: "Other Supporting Features",
  otherFeatures: [
    {
      title: "Consultation Session",
      content: "Schedule and manage direct consultation sessions with expert consultants. This feature allows you to discuss in-depth, request strategic advice, and plan the next steps in standard compliance."
    },
    {
      title: "Self-Assessment",
      content: "This tool helps you conduct an initial self-evaluation to get a general overview of compliance scores and priority areas before engaging more deeply with consultants. Click on the score circles to view detailed aspects of each pillar. Users and sub-users (team members) can access this feature."
    },
    {
      title: "Action Plan",
      content: "Create and manage task lists or action plans to meet unachieved criteria. This feature helps you stay organized in improvement efforts."
    },
    {
      title: "Learning Center",
      content: "Visit the \"Learning\" page to access documents, videos, and other resources relevant to sustainable tourism and GSTC Criteria."
    }
  ],
  faqTitle: "Frequently Asked Questions (FAQ)",
  faqs: [
    {
      question: "What are the GSTC Criteria and why are they important?",
      answer: "The Global Sustainable Tourism Council (GSTC) Criteria serve as the global standards for sustainability in travel and tourism. They are organized around four pillars: sustainable management, socio-economic impacts, cultural impacts, and environmental impacts. They help destinations protect resources, support local communities, and build long-term sustainability."
    },
    {
      question: "How do I start filling out the Standard Compliance?",
      answer: "Go to the Standard Compliance section, select a pillar, choose a specific criterion, and upload documents or insert URL links that prove you meet that criterion's requirements."
    },
    {
      question: "What is the difference between 'Draft', 'In Review', 'Done', and 'Rejected' statuses?",
      answer: "'Draft' means your evidence is still work-in-progress. 'In Review' means it is submitted to the consultants. 'Done' means approved, and 'Rejected' means it needs revision or didn't meet the standards."
    },
    {
      question: "How does the Self-Assessment feature work?",
      answer: "The Self-Assessment page allows you to answer quick, self-guided questions. Once completed, it updates your readiness score to show how prepared you are for certification."
    },
    {
      question: "What is an Action Plan and how do I use it?",
      answer: "An Action Plan is a list of tasks that help you bridge the gap between your current compliance level and the required standards. You can assign, schedule, and track tasks to completion."
    },
    {
      question: "What if I am confused about a specific criterion?",
      answer: "You can open the Discussion tab on that criterion to ask the expert consultant directly, or schedule a Consultation Session for in-depth discussion."
    },
    {
      question: "How do I schedule a Consultation Session?",
      answer: "Navigate to the Consultation page, open a ticket, specify your topic, and propose a time for the session with our consultants."
    },
    {
      question: "Who can view and fill out this data?",
      answer: "Only authorized Destination Managers (Owners), sub-team members (if added), and assigned Expert Consultants/Admins can view and edit the compliance data."
    }
  ]
};

const ownerMockGuideID: GuideData = {
  title: "Panduan Pengguna",
  subtitle: "Panduan lengkap untuk memulai, mengelola, dan memaksimalkan platform penilaian mandiri GSTC.",
  welcomeTitle: "Selamat Datang di Platform Penilaian Mandiri GSTC!",
  welcomeText1: "Platform ini dirancang untuk memandu destinasi pariwisata di Indonesia melalui proses evaluasi kepatuhan dengan Kriteria Destinasi Global Sustainable Tourism Council (GSTC).",
  welcomeText2: "Gunakan platform ini sebagai ruang kerja kolaboratif antara Anda sebagai Manajer Destinasi dan Konsultan Ahli untuk mengumpulkan bukti, menerima umpan balik, dan mencapai standar pariwisata berkelanjutan kelas dunia.",
  gettingStartedTitle: "Memulai dengan Kepatuhan",
  steps: [
    {
      number: 1,
      title: "Pahami Dashboard Utama",
      content: "Halaman 'Beranda' adalah pusat pemantauan Anda. Di sini Anda akan melihat ringkasan kemajuan kepatuhan untuk setiap pilar GSTC (A, B, C, D), area fokus yang perlu perbaikan prioritas, dan status akun Anda (Premium/Trial/Basic) di bagian profil."
    },
    {
      number: 2,
      title: "Navigasi ke Kepatuhan Standar",
      content: "Klik menu 'Kepatuhan Standard'. Di sini Anda akan menemukan empat pilar utama Kriteria Destinasi GSTC. Pilih pilar (misalnya, PILAR A: Pengelolaan Berkelanjutan) untuk melihat kriteria terperinci di dalamnya.",
      showPillBadges: true
    },
    {
      number: 3,
      title: "Unggah Bukti Kepatuhan",
      content: "Untuk setiap kriteria, ada beberapa indikator yang harus dipenuhi. Klik tombol 'Tautan Bukti' pada setiap indikator untuk mengunggah bukti kepatuhan berupa tautan link (contoh: Google Drive, Dropbox, atau dokumen publik).",
      subPoints: [
        "**Simpan sebagai Draf**: Gunakan opsi ini jika Anda belum siap mengirimkan bukti untuk ditinjau. Status akan menjadi 'Sedang Berjalan'.",
        "**Kirim untuk Ditinjau**: Jika bukti sudah lengkap dan siap, kirimkan untuk ditinjau konsultan. Status akan berubah menjadi 'Sedang Ditinjau', dan Anda tidak dapat mengubahnya hingga proses peninjauan selesai."
      ]
    }
  ],
  interactionTitle: "Berinteraksi dengan Konsultan",
  interactionText1: "Setiap kriteria memiliki fitur 'Diskusi'. Gunakan ini untuk berkomunikasi langsung dengan konsultan ahli. Anda dapat mengajukan pertanyaan, meminta klarifikasi, atau memberikan konteks tambahan tentang bukti yang diunggah.",
  interactionText2: "Setelah konsultan meninjau bukti Anda, status akan berubah menjadi 'Selesai' (Disetujui), 'Ditolak', atau 'Revisi' (Perlu Perbaikan). Periksa komentar konsultan untuk tindak lanjut.",
  otherFeaturesTitle: "Fitur Pendukung Lainnya",
  otherFeatures: [
    {
      title: "Sesi Konsultasi",
      content: "Jadwalkan dan kelola sesi konsultasi langsung dengan konsultan ahli. Fitur ini memungkinkan Anda berdiskusi secara mendalam, meminta saran strategis, dan merencanakan langkah selanjutnya dalam kepatuhan standar."
    },
    {
      title: "Penilaian Mandiri",
      content: "Alat ini membantu Anda melakukan evaluasi mandiri awal untuk mendapatkan gambaran umum tentang skor kepatuhan dan area prioritas sebelum terlibat lebih dalam dengan konsultan. Klik pada lingkaran skor untuk melihat aspek terperinci dari setiap pilar. Pengguna dan sub-pengguna (anggota tim) dapat mengakses fitur ini."
    },
    {
      title: "Rencana Aksi",
      content: "Buat dan kelola daftar tugas atau rencana aksi untuk memenuhi kriteria yang belum tercapai. Fitur ini membantu Anda tetap teratur dalam upaya perbaikan."
    },
    {
      title: "Pusat Pembelajaran",
      content: "Kunjungi halaman 'Materi' untuk mengakses dokumen, video, dan sumber daya lainnya yang relevan dengan pariwisata berkelanjutan dan Kriteria GSTC."
    }
  ],
  faqTitle: "Pertanyaan yang Sering Diajukan (FAQ)",
  faqs: [
    {
      question: "Apa itu Kriteria GSTC dan mengapa itu penting?",
      answer: "Kriteria Global Sustainable Tourism Council (GSTC) berfungsi sebagai standar global untuk keberlanjutan dalam perjalanan dan pariwisata. Mereka diatur dalam empat pilar: pengelolaan berkelanjutan, dampak sosial-ekonomi, dampak budaya, dan dampak lingkungan. Mereka membantu destinasi melindungi sumber daya, mendukung komunitas lokal, dan membangun keberlanjutan jangka panjang."
    },
    {
      question: "Bagaimana cara mulai mengisi Kepatuhan Standar?",
      answer: "Buka bagian Kepatuhan Standard, pilih pilar, pilih kriteria tertentu, lalu unggah dokumen atau masukkan tautan URL yang membuktikan Anda memenuhi persyaratan kriteria tersebut."
    },
    {
      question: "Apa perbedaan antara status 'Draf', 'Sedang Ditinjau', 'Selesai', dan 'Ditolak'?",
      answer: "'Draf' berarti bukti Anda masih dalam proses pengerjaan. 'Sedang Ditinjau' berarti bukti telah dikirim ke konsultan. 'Selesai' berarti disetujui, dan 'Ditolak' berarti memerlukan revisi atau tidak memenuhi standar."
    },
    {
      question: "Bagaimana cara kerja fitur Penilaian Mandiri?",
      answer: "Halaman Penilaian Mandiri memungkinkan Anda menjawab pertanyaan panduan mandiri dengan cepat. Setelah selesai, ini memperbarui skor kesiapan Anda untuk menunjukkan seberapa siap Anda untuk sertifikasi."
    },
    {
      question: "Apa itu Rencana Aksi dan bagaimana cara menggunakannya?",
      answer: "Rencana Aksi adalah daftar tugas yang membantu Anda menjembatani kesenjangan antara tingkat kepatuhan saat ini dan standar yang disyaratkan. Anda dapat menetapkan, menjadwalkan, dan melacak tugas hingga selesai."
    },
    {
      question: "Bagaimana jika saya bingung tentang kriteria tertentu?",
      answer: "Anda dapat membuka tab Diskusi pada kriteria tersebut untuk bertanya langsung kepada konsultan ahli, atau menjadwalkan Sesi Konsultasi untuk pembahasan mendalam."
    },
    {
      question: "Bagaimana cara menjadwalkan Sesi Konsultasi?",
      answer: "Navigasi ke halaman Konsultasi, buka tiket baru, tentukan topik Anda, dan ajukan waktu untuk sesi bersama konsultan kami."
    },
    {
      question: "Siapa yang dapat melihat dan mengisi data ini?",
      answer: "Hanya Manajer Destinasi (Pemilik) yang berwenang, anggota sub-tim (jika ditambahkan), dan Konsultan Ahli/Admin yang ditugaskan yang dapat melihat dan mengedit data kepatuhan."
    }
  ]
};

const visitorMockGuideEN: GuideData = {
  title: "Visitor Guide",
  subtitle: "Learn how to explore sustainable agritourism destinations and share your experiences.",
  welcomeTitle: "Welcome to Farmstay Nusantara!",
  welcomeText1: "Our platform connects travelers with eco-friendly farm stays, organic farms, and countryside lodges in Indonesia that practice real sustainability.",
  welcomeText2: "As a visitor, you can search for destinations, learn about sustainable travel practices, and write travel stories to inspire others.",
  gettingStartedTitle: "How to Use the Platform",
  steps: [
    {
      number: 1,
      title: "Explore Farmstay Destinations",
      content: "On the Explore homepage, browse curated local and global agritourism destinations. Find eco-friendly farm stays, organic farms, and countryside lodges that practice real sustainability."
    },
    {
      number: 2,
      title: "Community Forum Stories",
      content: "Go to 'Forum Stories' to read verified reviews and countryside diaries from other eco-travelers. You can also write your own organic farm experience, upload cover photos, and gather likes."
    },
    {
      number: 3,
      title: "Learning Resources Hub",
      content: "Access standard documents, video guides, and articles under the 'Resources' page. Filter guides by type (PDF, Video, etc.) to learn how to support local farming and rural communities."
    }
  ],
  otherFeaturesTitle: "Other Supporting Features",
  otherFeatures: [
    {
      title: "Interactive Map",
      content: "View destinations on an interactive map to plan your next eco-friendly road trip or countryside getaway."
    },
    {
      title: "Direct Messaging",
      content: "Reach out to farm owners directly to ask questions about lodging, sustainable activities, or local food."
    }
  ],
  faqTitle: "Frequently Asked Questions (FAQ)",
  faqs: [
    {
      question: "What is sustainable agritourism?",
      answer: "Sustainable agritourism is travel that combines agricultural visits with environmentally responsible hospitality. It supports local farmers, preserves cultural heritage, and has minimal impact on the environment."
    },
    {
      question: "Are the farm stays on this platform verified?",
      answer: "Yes, farm stays undergo a self-assessment and a compliance verification process based on GSTC standards reviewed by experts."
    },
    {
      question: "How do I write a forum story?",
      answer: "Go to the Forum page, click 'Write a Story', add a title, cover image, and details about your experience. Your story will be reviewed by admins before being published."
    }
  ]
};

const visitorMockGuideID: GuideData = {
  title: "Panduan Pengunjung",
  subtitle: "Pelajari cara menjelajahi destinasi agrowisata berkelanjutan dan membagikan kisah Anda.",
  welcomeTitle: "Selamat Datang di Farmstay Nusantara!",
  welcomeText1: "Platform kami menghubungkan wisatawan dengan farmstay ramah lingkungan, kebun organik, dan pondok pedesaan di Indonesia yang menerapkan keberlanjutan nyata.",
  welcomeText2: "Sebagai pengunjung, Anda dapat mencari destinasi, mempelajari praktik pariwisata ramah lingkungan, dan menulis cerita perjalanan untuk menginspirasi orang lain.",
  gettingStartedTitle: "Cara Menggunakan Platform",
  steps: [
    {
      number: 1,
      title: "Jelajahi Akomodasi Agrowisata",
      content: "Di halaman beranda Jelajah, jelajahi destinasi agrowisata lokal dan global yang terkurasi. Temukan farmstay ramah lingkungan, kebun organik, dan pondok pedesaan yang mempraktikkan keberlanjutan nyata."
    },
    {
      number: 2,
      title: "Kisah Forum Komunitas",
      content: "Buka 'Cerita Komunitas' untuk membaca ulasan terverifikasi dan buku harian pedesaan dari pelancong ramah lingkungan lainnya. Anda juga dapat menulis pengalaman pertanian organik Anda sendiri, mengunggah foto sampul, dan mengumpulkan suka."
    },
    {
      number: 3,
      title: "Pusat Pembelajaran & Materi",
      content: "Akses dokumen standar, panduan video, dan artikel di bawah halaman 'Materi'. Filter panduan berdasarkan jenis (PDF, Video, dll.) untuk mempelajari cara mendukung pertanian lokal dan masyarakat pedesaan."
    }
  ],
  otherFeaturesTitle: "Fitur Pendukung Lainnya",
  otherFeatures: [
    {
      title: "Peta Interaktif",
      content: "Lihat destinasi pada peta interaktif untuk merencanakan perjalanan darat ramah lingkungan atau liburan pedesaan Anda berikutnya."
    },
    {
      title: "Pesan Langsung",
      content: "Hubungi pemilik kebun secara langsung untuk mengajukan pertanyaan tentang penginapan, kegiatan berkelanjutan, atau makanan lokal."
    }
  ],
  faqTitle: "Pertanyaan yang Sering Diajukan (FAQ)",
  faqs: [
    {
      question: "Apa itu agrowisata berkelanjutan?",
      answer: "Agrowisata berkelanjutan adalah perjalanan yang menggabungkan kunjungan pertanian dengan keramahan yang ramah lingkungan. Ini mendukung petani lokal, melestarikan warisan budaya, dan memiliki dampak minimal terhadap lingkungan."
    },
    {
      question: "Apakah farmstay di platform ini terverifikasi?",
      answer: "Ya, farmstay menjalani evaluasi mandiri dan proses verifikasi kepatuhan berdasarkan standar GSTC yang ditinjau oleh para ahli."
    },
    {
      question: "Bagaimana cara menulis cerita forum?",
      answer: "Buka halaman Forum, klik 'Tulis Cerita', tambahkan judul, gambar sampul, dan detail tentang pengalaman Anda. Cerita Anda akan ditinjau oleh admin sebelum diterbitkan secara publik."
    }
  ]
};

export const guideService = {
  /**
   * Fetch guide data dynamically from backend API.
   * If endpoint is not yet defined by the admin, falls back to high-fidelity dummy data.
   */
  async getGuideData(role: string, locale: string): Promise<ApiResponse<GuideData>> {
    try {
      const response = await apiClient.get<ApiResponse<GuideData>>(`/guides?role=${role}&locale=${locale}`);
      if (response.data && response.data.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn("Backend /guides API not available, using high-fidelity dummy data fallback.");
    }
    
    // Fallback Mock Data based on locale and role
    const isId = locale === "id";
    let fallbackData: GuideData;
    
    if (isId) {
      fallbackData = role === "owner" ? ownerMockGuideID : visitorMockGuideID;
    } else {
      fallbackData = role === "owner" ? ownerMockGuideEN : visitorMockGuideEN;
    }
    
    return {
      status: "success",
      code: 200,
      message: `Loaded fallback guide data successfully for ${locale} (${role})`,
      data: fallbackData
    };
  }
};

export default guideService;
