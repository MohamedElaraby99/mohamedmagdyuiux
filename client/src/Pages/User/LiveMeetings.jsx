import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getUpcomingLiveMeetings,
  getUserLiveMeetings,
  getLiveMeeting
} from '../../Redux/Slices/LiveMeetingSlice';
import Layout from '../../Layout/Layout';
import {
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaVideo,
  FaChalkboardTeacher,
  FaBookOpen,
  FaGraduationCap,
  FaExternalLinkAlt,
  FaPlay,
  FaEye,
  FaSearch,
  FaTimes
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

/* ─── colour tokens ─────────────────────────────────────────────────── */
const PAGE_BG  = '#0C1325';
const CARD_BG  = '#162040';
const CARD_BDR = 'rgba(255,255,255,0.07)';
const DIVIDER  = 'rgba(255,255,255,0.06)';

const LiveMeetings = () => {
  const dispatch = useDispatch();
  const { upcomingMeetings, myMeetings, loading } = useSelector(state => state.liveMeeting);

  const [activeTab, setActiveTab]         = useState('upcoming');
  const [searchQuery, setSearchQuery]     = useState('');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'upcoming') {
      dispatch(getUpcomingLiveMeetings());
    } else {
      dispatch(getUserLiveMeetings({ status: statusFilter === 'all' ? '' : statusFilter }));
    }
  }, [dispatch, activeTab, statusFilter]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });

  const getDuration = (minutes) => {
    const h = Math.floor(minutes / 60), m = minutes % 60;
    return h > 0 ? `${h} ساعة${m > 0 ? ` و ${m} دقيقة` : ''}` : `${m} دقيقة`;
  };

  const getStatusMeta = (status) => {
    switch (status) {
      case 'scheduled': return { label: 'مجدول',      color: 'var(--color-primary-light)', bg: 'rgba(139,92,246,0.15)' };
      case 'live':      return { label: 'مباشر الآن', color: '#ef4444',                   bg: 'rgba(239,68,68,0.15)' };
      case 'completed': return { label: 'انتهى',       color: '#10b981',                   bg: 'rgba(16,185,129,0.15)' };
      case 'cancelled': return { label: 'ملغي',        color: '#94a3b8',                   bg: 'rgba(148,163,184,0.1)' };
      default:          return { label: status,        color: '#94a3b8',                   bg: 'rgba(148,163,184,0.1)' };
    }
  };

  const isMeetingLive = (m) => {
    const now = new Date(), start = new Date(m.scheduledDate);
    return now >= start && now <= new Date(start.getTime() + m.duration * 60000) && m.status === 'live';
  };

  const isMeetingUpcoming = (m) => new Date(m.scheduledDate) > new Date() && m.status === 'scheduled';

  const handleJoinMeeting = async (id) => {
    try {
      const result = await dispatch(getLiveMeeting(id)).unwrap();
      if (result.liveMeeting?.googleMeetLink) window.open(result.liveMeeting.googleMeetLink, '_blank');
      else toast.error('رابط الاجتماع غير متوفر');
    } catch { toast.error('فشل في الانضمام للاجتماع'); }
  };

  const handleViewMeeting = async (id) => {
    try {
      const result = await dispatch(getLiveMeeting(id)).unwrap();
      setSelectedMeeting(result.liveMeeting);
      setShowMeetingModal(true);
    } catch { /* silent */ }
  };

  const filterMeetings = (list) =>
    list.filter(m =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  /* ── meeting card ───────────────────────────────────────────────── */
  const MeetingCard = ({ meeting }) => {
    const statusMeta = getStatusMeta(meeting.status);
    const live       = isMeetingLive(meeting);
    const upcoming   = isMeetingUpcoming(meeting);

    return (
      <div className="rounded-2xl p-5 flex flex-col gap-4 transition-all hover:brightness-110"
        style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BDR}` }}>

        {/* title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base leading-snug mb-1 line-clamp-1">
              {meeting.title}
            </h3>
            <p className="text-sm line-clamp-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {meeting.description}
            </p>
          </div>
          <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: statusMeta.bg, color: statusMeta.color }}>
            {live && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-1" />}
            {statusMeta.label}
          </span>
        </div>

        {/* meta grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <span className="flex items-center gap-2">
            <FaCalendarAlt style={{ color: 'var(--color-primary-light)' }} />
            {formatDate(meeting.scheduledDate)}
          </span>
          <span className="flex items-center gap-2">
            <FaClock style={{ color: 'var(--color-primary-light)' }} />
            {formatTime(meeting.scheduledDate)} · {getDuration(meeting.duration)}
          </span>
          {meeting.instructor?.name && (
            <span className="flex items-center gap-2">
              <FaChalkboardTeacher style={{ color: 'var(--color-primary-light)' }} />
              {meeting.instructor.name}
            </span>
          )}
          {meeting.subject?.title && (
            <span className="flex items-center gap-2">
              <FaBookOpen style={{ color: 'var(--color-primary-light)' }} />
              {meeting.subject.title}
            </span>
          )}
          <span className="flex items-center gap-2 col-span-full">
            <FaUsers className="text-cyan-400 flex-shrink-0" />
            {meeting.attendeesCount || 0} مشارك
          </span>
          {meeting.googleMeetLink && (
            <span className="flex items-center gap-2 col-span-full truncate">
              <FaVideo className="text-red-400 flex-shrink-0" />
              <a href={meeting.googleMeetLink} target="_blank" rel="noopener noreferrer"
                className="truncate underline" style={{ color: 'var(--color-primary-light)' }}>
                {meeting.googleMeetLink}
              </a>
            </span>
          )}
        </div>

        {/* divider */}
        <div style={{ borderTop: `1px solid ${DIVIDER}` }} />

        {/* actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => { navigator.clipboard.writeText(meeting.googleMeetLink); toast.success('تم نسخ الرابط'); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: `1px solid ${CARD_BDR}` }}
            >
              <FaVideo className="text-[10px]" />نسخ الرابط
            </button>
            <button
              onClick={() => handleViewMeeting(meeting._id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: `1px solid ${CARD_BDR}` }}
            >
              <FaEye className="text-[10px]" />التفاصيل
            </button>
          </div>

          <div className="flex gap-2">
            {live && (
              <button
                onClick={() => handleJoinMeeting(meeting._id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white animate-pulse transition-all"
                style={{ backgroundColor: '#ef4444' }}
              >
                <FaVideo />انضم الآن
              </button>
            )}
            {upcoming && (
              <button
                onClick={() => toast.success('سيتم إشعارك قبل بدء الاجتماع')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90 active:scale-95 btn-primary"
              >
                <FaPlay className="text-[10px]" />تذكير
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ── empty state ─────────────────────────────────────────────────── */
  const EmptyState = ({ icon: Icon, title, subtitle }) => (
    <div className="col-span-full text-center py-16">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
        <Icon className="text-2xl" style={{ color: 'rgba(255,255,255,0.25)' }} />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{subtitle}</p>
    </div>
  );

  /* ── page ────────────────────────────────────────────────────────── */
  return (
    <Layout mainClassName="min-h-[100vh] bg-[#0C1325]">
      <div className="min-h-screen bg-[#0C1325] py-8" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}>
                <FaVideo className="text-sm" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient-primary">
                الجلسات المباشرة
              </h1>
            </div>
            <p className="text-sm mr-[52px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              شاهد واشترك في الجلسات التعليمية المباشرة
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'upcoming',    label: 'الجلسات القادمة' },
              { id: 'my-meetings', label: 'اجتماعاتي' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={activeTab === tab.id
                  ? { backgroundColor: 'var(--color-primary)', color: '#fff' }
                  : { backgroundColor: CARD_BG, border: `1px solid ${CARD_BDR}`, color: 'rgba(255,255,255,0.5)' }
                }>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters bar */}
          <div className="rounded-2xl p-4 mb-6 flex flex-wrap gap-3"
            style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BDR}` }}>
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input
                type="text"
                placeholder="البحث في الجلسات..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-4 py-2.5 rounded-xl text-white text-sm outline-none placeholder-white/30 transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${CARD_BDR}` }}
              />
            </div>
            {/* Status filter (only in my-meetings) */}
            {activeTab === 'my-meetings' && (
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${CARD_BDR}` }}
              >
                <option value="all"       style={{ backgroundColor: CARD_BG }}>جميع الحالات</option>
                <option value="scheduled" style={{ backgroundColor: CARD_BG }}>مجدولة</option>
                <option value="live"      style={{ backgroundColor: CARD_BG }}>مباشرة</option>
                <option value="completed" style={{ backgroundColor: CARD_BG }}>منتهية</option>
                <option value="cancelled" style={{ backgroundColor: CARD_BG }}>ملغاة</option>
              </select>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-11 h-11 rounded-full animate-spin"
                style={{ border: '3px solid var(--color-primary)', borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>جاري تحميل الجلسات...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeTab === 'upcoming'
                ? filterMeetings(upcomingMeetings).length > 0
                    ? filterMeetings(upcomingMeetings).map(m => <MeetingCard key={m._id} meeting={m} />)
                    : <EmptyState icon={FaCalendarAlt} title="لا توجد جلسات قادمة" subtitle="سيتم إشعارك عند إضافة جلسات جديدة" />
                : filterMeetings(myMeetings).length > 0
                    ? filterMeetings(myMeetings).map(m => <MeetingCard key={m._id} meeting={m} />)
                    : <EmptyState icon={FaVideo} title="لا توجد اجتماعات" subtitle="لم تشترك في أي اجتماعات بعد" />
              }
            </div>
          )}
        </div>

        {/* ── Meeting Detail Modal ─────────────────────────────────── */}
        {showMeetingModal && selectedMeeting && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
            onClick={e => e.target === e.currentTarget && setShowMeetingModal(false)}>
            <div className="rounded-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BDR}` }}>

              {/* modal header */}
              <div className="px-6 py-5 relative"
                style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}>
                <button onClick={() => setShowMeetingModal(false)}
                  className="absolute left-4 top-4 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  <FaTimes className="text-xs text-white" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <FaVideo className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white leading-tight">{selectedMeeting.title}</h2>
                    <span className="text-xs mt-0.5 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)' }}>
                      {getStatusMeta(selectedMeeting.status).label}
                    </span>
                  </div>
                </div>
              </div>

              {/* modal body */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* details */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
                      تفاصيل الجلسة
                    </h3>
                    <div className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {[
                        { icon: <FaCalendarAlt />, text: formatDate(selectedMeeting.scheduledDate) },
                        { icon: <FaClock />,        text: `${formatTime(selectedMeeting.scheduledDate)} · ${getDuration(selectedMeeting.duration)}` },
                        selectedMeeting.instructor?.name && { icon: <FaChalkboardTeacher />, text: selectedMeeting.instructor.name },
                        selectedMeeting.subject?.title   && { icon: <FaBookOpen />,          text: selectedMeeting.subject.title },
                      ].filter(Boolean).map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span style={{ color: 'var(--color-primary-light)' }}>{item.icon}</span>
                          <span>{item.text}</span>
                        </div>
                      ))}
                      {selectedMeeting.googleMeetLink && (
                        <div className="flex items-start gap-3">
                          <FaVideo className="text-red-400 mt-0.5 flex-shrink-0" />
                          <a href={selectedMeeting.googleMeetLink} target="_blank" rel="noopener noreferrer"
                            className="underline break-all text-xs" style={{ color: 'var(--color-primary-light)' }}>
                            {selectedMeeting.googleMeetLink}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* description */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
                      الوصف
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {selectedMeeting.description}
                    </p>
                  </div>
                </div>

                {/* modal actions */}
                <div className="flex flex-wrap justify-end gap-2 pt-4" style={{ borderTop: `1px solid ${DIVIDER}` }}>
                  <button onClick={() => setShowMeetingModal(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-80"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: `1px solid ${CARD_BDR}` }}>
                    إغلاق
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(selectedMeeting.googleMeetLink); toast.success('تم نسخ الرابط'); }}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-80"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: `1px solid ${CARD_BDR}` }}>
                    نسخ الرابط
                  </button>
                  {isMeetingLive(selectedMeeting) && (
                    <button
                      onClick={() => { window.open(selectedMeeting.googleMeetLink, '_blank'); setShowMeetingModal(false); }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white animate-pulse"
                      style={{ backgroundColor: '#ef4444' }}>
                      <FaVideo />انضم للجلسة المباشرة<FaExternalLinkAlt className="text-xs" />
                    </button>
                  )}
                  {!isMeetingLive(selectedMeeting) && selectedMeeting.status === 'scheduled' && (
                    <button
                      onClick={() => { window.open(selectedMeeting.googleMeetLink, '_blank'); setShowMeetingModal(false); }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95 btn-primary">
                      <FaVideo />فتح الرابط<FaExternalLinkAlt className="text-xs" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LiveMeetings;
