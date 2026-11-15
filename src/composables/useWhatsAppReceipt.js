export function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val) || 0)
}

export function buildStudentReceiptText({ student, semester }) {
  const nama = student?.nama || 'Mahasiswa'
  const nim = student?.nim || '251*********'
  const semesterNama = semester?.nama || 'Semester Aktif'
  const bayar = Number(student?.nominal) || 0
  const target = Number(student?.targetKas || semester?.targetKasPerMhs) || 50000
  const isLunas = student?.status === 'Lunas' || bayar >= target
  const statusEmoji = isLunas ? '✅ *LUNAS*' : '⏳ *BELUM LUNAS*'

  let text = `🧾 *BUKTI PEMBAYARAN KAS KELAS*\n`
  text += `================================\n`
  text += `*Mahasiswa:* ${nama}\n`
  text += `*NIM:* ${nim}\n`
  text += `*Semester:* ${semesterNama}\n\n`
  text += `• *Status Kas:* ${statusEmoji}\n`
  text += `• *Total Terbayar:* ${formatCurrency(bayar)}\n`
  text += `• *Target Kas:* ${formatCurrency(target)}\n`

  if (!isLunas) {
    const sisa = Math.max(0, target - bayar)
    text += `• *Sisa Kekurangan:* ${formatCurrency(sisa)}\n`
  }

  // Jika ada detail mingguan absensi
  if (Array.isArray(student?.detailMingguan) && student.detailMingguan.length > 0) {
    const lunasList = student.detailMingguan.filter((d) => d.bayar)
    text += `• *Kehadiran Kas:* ${lunasList.length} dari ${student.detailMingguan.length} Pertemuan\n\n`
    text += `*Rincian Pertemuan:*\n`
    student.detailMingguan.forEach((d) => {
      const tanda = d.bayar ? '✓ Lunas' : '- Belum'
      text += `P${d.pertemuanKe} (${d.tanggal}): ${tanda}\n`
    })
  }

  text += `\n_Dicatat resmi oleh Sistem Buku Kas Kelas_\n`
  text += `_Terima kasih atas kerja sama dan partisipasinya! 🙌✨_`

  return text
}

export function openStudentReceiptWhatsApp({ student, semester }) {
  const text = buildStudentReceiptText({ student, semester })
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}
