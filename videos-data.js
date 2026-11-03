/**
 * DAFTAR MATERI VIDEO DAN DOKUMEN RESMI PT MEST INDONESIA
 * Terintegrasi langsung dengan Google Drive:
 * https://drive.google.com/drive/u/0/folders/17pkeDvs9uXzbZNNsrzFiVvFy4r_hmOOQ
 *
 * Folder About Us: 10 Video (Folder ID: 1n4R9qg5viVONZNQzWGDCRECm088pndOW)
 * Folder Galleries: 8 Video (Folder ID: 1bK1SOO_VoZxYkd2GU9ffdSvXZFgWyCYN)
 * Folder Catalog: 1 PDF (Folder ID: 1OkRJKy56c66OWDL_v1euabvp6xJPGLTI, File ID: 1OabtPEg9NYqQ5ilWyq_A6jjQ8l6zH3Oc)
 */

const GOOGLE_DRIVE_ROOT_FOLDER = "https://drive.google.com/drive/u/0/folders/17pkeDvs9uXzbZNNsrzFiVvFy4r_hmOOQ";

const CATALOG_DRIVE_DOCUMENT = {
  title: "Pocket Book 2026 (Buku Saku Pupuk Mestindo)",
  id: "1OabtPEg9NYqQ5ilWyq_A6jjQ8l6zH3Oc",
  filename: "[291026] - POCKET BOOK 2026 (GABUNG).pdf",
  mimeType: "application/pdf",
  driveUrl: "https://drive.google.com/file/d/1OabtPEg9NYqQ5ilWyq_A6jjQ8l6zH3Oc/view?usp=sharing",
  previewUrl: "https://drive.google.com/file/d/1OabtPEg9NYqQ5ilWyq_A6jjQ8l6zH3Oc/preview"
};

const LOCAL_VIDEOS = [
  /* =========================================================================
     ABOUT US (10 Video Terverifikasi dari Google Drive)
     ========================================================================= */
  {
    title: "A with Senior Agronomist - Mestindo Rudy Bcc",
    section: "about-us",
    category: "About Us",
    driveId: "1D1LpsWvodAuXZg12JzcMIq7eDNhowJgy",
    driveUrl: "https://drive.google.com/file/d/1D1LpsWvodAuXZg12JzcMIq7eDNhowJgy/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/1D1LpsWvodAuXZg12JzcMIq7eDNhowJgy/preview",
    file: "https://drive.google.com/file/d/1D1LpsWvodAuXZg12JzcMIq7eDNhowJgy/view?usp=sharing",
    localFile: "videos/Portrait/090926 - A with senior agronomist  - Mestindo - RudyBcc.mp4",
    description: "Potrait - A with senior agronomist  - Mestindo - RudyBcc.mp4"
  },
  {
    title: "Branding Employer",
    section: "about-us",
    category: "About Us",
    driveId: "1ysxjK4lDzHutPsgL_IEiMjVHyM-3rfc1",
    driveUrl: "https://drive.google.com/file/d/1ysxjK4lDzHutPsgL_IEiMjVHyM-3rfc1/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/1ysxjK4lDzHutPsgL_IEiMjVHyM-3rfc1/preview",
    file: "https://drive.google.com/file/d/1ysxjK4lDzHutPsgL_IEiMjVHyM-3rfc1/view?usp=sharing",
    localFile: "videos/Portrait/Branding Employer.1.mp4",
    description: "Potrait - Branding Employer.1.mp4"
  },
  {
    title: "Factory Visit (Riau)",
    section: "about-us",
    category: "About Us",
    driveId: "1Gx1ZlsFILkTTCewHpV9AvPQeUGR0Y52c",
    driveUrl: "https://drive.google.com/file/d/1Gx1ZlsFILkTTCewHpV9AvPQeUGR0Y52c/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/1Gx1ZlsFILkTTCewHpV9AvPQeUGR0Y52c/preview",
    file: "https://drive.google.com/file/d/1Gx1ZlsFILkTTCewHpV9AvPQeUGR0Y52c/view?usp=sharing",
    localFile: "videos/Portrait/VERTICAL - FACTORY VISIT (RIAU).mp4",
    description: "Potrait - FACTORY VISIT (RIAU).mp4"
  },
  {
    title: "GL Mesticote",
    section: "about-us",
    category: "About Us",
    driveId: "1cf9fVS9OT2lZzTL0Vd2tPktFW1Nwr176",
    driveUrl: "https://drive.google.com/file/d/1cf9fVS9OT2lZzTL0Vd2tPktFW1Nwr176/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/1cf9fVS9OT2lZzTL0Vd2tPktFW1Nwr176/preview",
    file: "https://drive.google.com/file/d/1cf9fVS9OT2lZzTL0Vd2tPktFW1Nwr176/view?usp=sharing",
    localFile: "videos/Portrait/GL MESTICOTE.mov",
    description: "Potrait - GL MESTICOTE.mov"
  },
  {
    title: "Logo Mestindo",
    section: "about-us",
    category: "About Us",
    driveId: "1DkiTY6Y6t9-FPNcRDg9YSLXYBVpULD_l",
    driveUrl: "https://drive.google.com/file/d/1DkiTY6Y6t9-FPNcRDg9YSLXYBVpULD_l/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/1DkiTY6Y6t9-FPNcRDg9YSLXYBVpULD_l/preview",
    file: "https://drive.google.com/file/d/1DkiTY6Y6t9-FPNcRDg9YSLXYBVpULD_l/view?usp=sharing",
    localFile: "videos/Portrait/Logo Vertical.mp4",
    description: "Potrait - Logo.mp4"
  },
  {
    title: "Mestindo NPK Factory's Anniversary",
    section: "about-us",
    category: "About Us",
    driveId: "1dfe5kACfIBYIRatNmeMCrfX9HOM_WxZp",
    driveUrl: "https://drive.google.com/file/d/1dfe5kACfIBYIRatNmeMCrfX9HOM_WxZp/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/1dfe5kACfIBYIRatNmeMCrfX9HOM_WxZp/preview",
    file: "https://drive.google.com/file/d/1dfe5kACfIBYIRatNmeMCrfX9HOM_WxZp/view?usp=sharing",
    localFile: "videos/Portrait/Mestindo NPK Factory_s Anniversary.mp4",
    description: "Potrait - Mestindo NPK Factory's Anniversary.mp4"
  },
  {
    title: "Recap Visit Factory NPK Compound Steam Fertilizers",
    section: "about-us",
    category: "About Us",
    driveId: "14ctWPxDFpD8JRdxvv1lR0CJvmWUg6mXu",
    driveUrl: "https://drive.google.com/file/d/14ctWPxDFpD8JRdxvv1lR0CJvmWUg6mXu/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/14ctWPxDFpD8JRdxvv1lR0CJvmWUg6mXu/preview",
    file: "https://drive.google.com/file/d/14ctWPxDFpD8JRdxvv1lR0CJvmWUg6mXu/view?usp=sharing",
    localFile: "videos/Landscape/FACTORY VISIT (RIAU).mp4",
    description: "Potrait - RECAP VISIT FACTORY NPK COMPOUND STEAM FERTILIZERS (4).mp4"
  },
  {
    title: "The Gold Standard of Quality and Safety",
    section: "about-us",
    category: "About Us",
    driveId: "1KFHYqt2I4kB5QcRt3_SNsQuEVCriPdC-",
    driveUrl: "https://drive.google.com/file/d/1KFHYqt2I4kB5QcRt3_SNsQuEVCriPdC-/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/1KFHYqt2I4kB5QcRt3_SNsQuEVCriPdC-/preview",
    file: "https://drive.google.com/file/d/1KFHYqt2I4kB5QcRt3_SNsQuEVCriPdC-/view?usp=sharing",
    localFile: "videos/Landscape/Factory Anniversary.mp4",
    description: "Potrait - THE GOLD STANDARD OF QUALITY AND SAFETY ( 06 05 2026).mp4"
  },
  {
    title: "Company Profile Mestindo",
    section: "about-us",
    category: "About Us",
    driveId: "13EwlztXMBFzp4Z5llcAlFKDMxYryCFtB",
    driveUrl: "https://drive.google.com/file/d/13EwlztXMBFzp4Z5llcAlFKDMxYryCFtB/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/13EwlztXMBFzp4Z5llcAlFKDMxYryCFtB/preview",
    file: "https://drive.google.com/file/d/13EwlztXMBFzp4Z5llcAlFKDMxYryCFtB/view?usp=sharing",
    localFile: "videos/Portrait/Branding Employer.1.mp4",
    description: "Potrait Company Profile.mp4"
  },
  {
    title: "Distribusi & Jaringan Peta Mestindo",
    section: "about-us",
    category: "About Us",
    driveId: "1fJIeRBG2wT_A67ZZCWNLBPgvE7vXAW_-",
    driveUrl: "https://drive.google.com/file/d/1fJIeRBG2wT_A67ZZCWNLBPgvE7vXAW_-/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/1fJIeRBG2wT_A67ZZCWNLBPgvE7vXAW_-/preview",
    file: "https://drive.google.com/file/d/1fJIeRBG2wT_A67ZZCWNLBPgvE7vXAW_-/view?usp=sharing",
    localFile: "videos/Portrait/Vertical Mapping.mp4",
    description: "Potrait Map.mp4"
  },

  /* =========================================================================
     GALLERIES (8 Video Terverifikasi dari Google Drive)
     ========================================================================= */
  {
    title: "Cerita Dibalik Sawit Defisiensi Boron (Laoying)",
    section: "galleries",
    category: "Galleries",
    driveId: "1Jk00qUvwuUea6DA6XWx0KQcWvelcuVQD",
    driveUrl: "https://drive.google.com/file/d/1Jk00qUvwuUea6DA6XWx0KQcWvelcuVQD/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/1Jk00qUvwuUea6DA6XWx0KQcWvelcuVQD/preview",
    file: "https://drive.google.com/file/d/1Jk00qUvwuUea6DA6XWx0KQcWvelcuVQD/view?usp=sharing",
    localFile: "videos/Portrait/Penggunaan Spreader pada NPK.mp4",
    description: "Potrait - CERITA DIBALIK SAWIT DEFISIENSI BORON (LAOYING).mp4"
  },
  {
    title: "CRF Mesticote - Solusi Pemupukan Terkendali",
    section: "galleries",
    category: "Galleries",
    driveId: "1SuGAZTqie_VlE33mzVczFtrjJ8I5DXw4",
    driveUrl: "https://drive.google.com/file/d/1SuGAZTqie_VlE33mzVczFtrjJ8I5DXw4/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/1SuGAZTqie_VlE33mzVczFtrjJ8I5DXw4/preview",
    file: "https://drive.google.com/file/d/1SuGAZTqie_VlE33mzVczFtrjJ8I5DXw4/view?usp=sharing",
    localFile: "videos/Portrait/GL MESTICOTE.mov",
    description: "Potrait - CRF Mesticote.mp4"
  },
  {
    title: "Gambut Subur, Cukup 2x Setahun",
    section: "galleries",
    category: "Galleries",
    driveId: "1bQV3jJiiIGkEQtmsxS40Oz3UqNmwcbDq",
    driveUrl: "https://drive.google.com/file/d/1bQV3jJiiIGkEQtmsxS40Oz3UqNmwcbDq/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/1bQV3jJiiIGkEQtmsxS40Oz3UqNmwcbDq/preview",
    file: "https://drive.google.com/file/d/1bQV3jJiiIGkEQtmsxS40Oz3UqNmwcbDq/view?usp=sharing",
    localFile: "videos/Portrait/Penggunaan Spreader pada NPK.mp4",
    description: "Potrait - GAMBUT SUBUR, CUKUP 2X SETAHUN-2.mp4"
  },
  {
    title: "Pengendalian & Pencegahan Ganoderma Sawit",
    section: "galleries",
    category: "Galleries",
    driveId: "1YZT64gSjr-zEG-xynXctk8TvcgasgY_Z",
    driveUrl: "https://drive.google.com/file/d/1YZT64gSjr-zEG-xynXctk8TvcgasgY_Z/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/1YZT64gSjr-zEG-xynXctk8TvcgasgY_Z/preview",
    file: "https://drive.google.com/file/d/1YZT64gSjr-zEG-xynXctk8TvcgasgY_Z/view?usp=sharing",
    localFile: "videos/Portrait/Penggunaan Spreader pada NPK.mp4",
    description: "Potrait - Ganoderma.mp4"
  },
  {
    title: "Kamus Sawit Mestindo bersama Rudy Bcc",
    section: "galleries",
    category: "Galleries",
    driveId: "1mLnV2BJn5OkIcPgTlSUECF8FUEWTN2a-",
    driveUrl: "https://drive.google.com/file/d/1mLnV2BJn5OkIcPgTlSUECF8FUEWTN2a-/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/1mLnV2BJn5OkIcPgTlSUECF8FUEWTN2a-/preview",
    file: "https://drive.google.com/file/d/1mLnV2BJn5OkIcPgTlSUECF8FUEWTN2a-/view?usp=sharing",
    localFile: "videos/Portrait/090926 - A with senior agronomist  - Mestindo - RudyBcc.mp4",
    description: "Potrait - Kamus Sawit - Mestindo - Rudy Bcc.mp4"
  },
  {
    title: "Mesti Top - Formula Pupuk Unggul",
    section: "galleries",
    category: "Galleries",
    driveId: "109AaoXYhQrATnzo5Hw4lVEbbKUv2cl9J",
    driveUrl: "https://drive.google.com/file/d/109AaoXYhQrATnzo5Hw4lVEbbKUv2cl9J/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/109AaoXYhQrATnzo5Hw4lVEbbKUv2cl9J/preview",
    file: "https://drive.google.com/file/d/109AaoXYhQrATnzo5Hw4lVEbbKUv2cl9J/view?usp=sharing",
    localFile: "videos/Landscape/Mesticote.mp4",
    description: "Potrait - MESTI TOP.mp4"
  },
  {
    title: "Mestika Super - Nutrisi Tanaman Maksimal",
    section: "galleries",
    category: "Galleries",
    driveId: "1lIBtwOJU-SikN-KJkOLAGyjQISF9OLXO",
    driveUrl: "https://drive.google.com/file/d/1lIBtwOJU-SikN-KJkOLAGyjQISF9OLXO/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/1lIBtwOJU-SikN-KJkOLAGyjQISF9OLXO/preview",
    file: "https://drive.google.com/file/d/1lIBtwOJU-SikN-KJkOLAGyjQISF9OLXO/view?usp=sharing",
    localFile: "videos/Landscape/Mesticote.mp4",
    description: "Potrait - Mestika Super.mp4"
  },
  {
    title: "Penggunaan Spreader pada NPK",
    section: "galleries",
    category: "Galleries",
    driveId: "1BJbq3Y4hz8hvS-SyUv3rKghv451V9bMV",
    driveUrl: "https://drive.google.com/file/d/1BJbq3Y4hz8hvS-SyUv3rKghv451V9bMV/view?usp=sharing",
    previewUrl: "https://drive.google.com/file/d/1BJbq3Y4hz8hvS-SyUv3rKghv451V9bMV/preview",
    file: "https://drive.google.com/file/d/1BJbq3Y4hz8hvS-SyUv3rKghv451V9bMV/view?usp=sharing",
    localFile: "videos/Portrait/Penggunaan Spreader pada NPK.mp4",
    description: "Potrait - Penggunaan Spreader pada NPK.mp4"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GOOGLE_DRIVE_ROOT_FOLDER,
    CATALOG_DRIVE_DOCUMENT,
    LOCAL_VIDEOS
  };
}
