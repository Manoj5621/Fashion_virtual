import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Layout,
  ConfigProvider,
  theme,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Avatar,
  Tag,
  Divider,
  Spin,
  Empty,
  Badge,
  Timeline,
  Statistic,
  Space,
  Modal,
  message
} from 'antd';
import {
  ArrowLeftOutlined,
  PictureOutlined,
  UserOutlined,
  ShoppingOutlined,
  ExperimentOutlined,
  CalendarOutlined,
  DownloadOutlined,
  EyeOutlined,
  ShareAltOutlined,
  HeartOutlined,
  HeartFilled,
  StarFilled,
  TeamOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  AppstoreOutlined,
  MenuOutlined
} from '@ant-design/icons';
import './Gallery.css';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

function Gallery() {
  const [galleryData, setGalleryData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [filterUser, setFilterUser] = useState('');
  const [likedItems, setLikedItems] = useState([]);
  const [stats, setStats] = useState({
    totalTryOns: 0,
    uniqueUsers: 0,
    totalImages: 0
  });

  const navigate = useNavigate();
  const { defaultAlgorithm, darkAlgorithm } = theme;

  // Get username from localStorage
  const username = localStorage.getItem("UserName");

  // Color schemes for different users
  const colorSchemes = [
    { primary: '#8b5cf6', secondary: '#ddd6fe', accent: '#c4b5fd' },
    { primary: '#10b981', secondary: '#d1fae5', accent: '#a7f3d0' },
    { primary: '#3b82f6', secondary: '#dbeafe', accent: '#93c5fd' },
    { primary: '#ef4444', secondary: '#fee2e2', accent: '#fca5a5' },
    { primary: '#f59e0b', secondary: '#fef3c7', accent: '#fcd34d' },
    { primary: '#ec4899', secondary: '#fce7f3', accent: '#f9a8d4' },
    { primary: '#06b6d4', secondary: '#cffafe', accent: '#67e8f9' },
  ];

  useEffect(() => {
    fetchGalleryData();
  }, []);

  useEffect(() => {
    if (galleryData.length > 0) {
      groupDataByUser();
      calculateStats();
    }
  }, [galleryData, sortBy]);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/gallery', {
        params: { username }
      });
      const data = response.data;
      setGalleryData(data.gallery || data);
    } catch (error) {
      console.error('Error fetching gallery data:', error);
      message.error('Failed to load gallery data');
    } finally {
      setLoading(false);
    }
  };

  const groupDataByUser = () => {
    const grouped = {};
    
    // Sort data based on selected criteria
    const sortedData = [...galleryData].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdat) - new Date(a.createdat);
      }
      // Add other sort criteria here if needed
      return 0;
    });

    sortedData.forEach(item => {
      if (!grouped[item.username]) {
        grouped[item.username] = [];
      }
      grouped[item.username].push(item);
    });

    setGroupedData(grouped);
  };

  const calculateStats = () => {
    const users = new Set(galleryData.map(item => item.username));
    setStats({
      totalTryOns: galleryData.length,
      uniqueUsers: users.size,
      totalImages: galleryData.length * 3 // 3 images per try-on
    });
  };

  const getUserColorScheme = (userIndex) => {
    return colorSchemes[userIndex % colorSchemes.length];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImageClick = (image, user, index) => {
    setSelectedImage({ ...image, user, index });
    setModalVisible(true);
  };

  const handleDownload = (imageUrl, type) => {
    const path = imageUrl.replace('http://localhost:8000/uploads/', '');
    const downloadUrl = `http://localhost:8000/api/download/${path}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${type}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Image downloaded successfully!');
  };

  const handleLike = (username, index) => {
    const key = `${username}-${index}`;
    setLikedItems(prev => {
      const newLikes = prev.includes(key) 
        ? prev.filter(item => item !== key)
        : [...prev, key];
      localStorage.setItem('likedGalleryItems', JSON.stringify(newLikes));
      return newLikes;
    });
  };

  const handleShare = (image) => {
    const shareUrl = image.output_image_path || image.person_image_url;
    navigator.clipboard.writeText(shareUrl);
    message.success('Image link copied to clipboard!');
  };

  const getTryonNumber = (username, index) => {
    const userItems = groupedData[username] || [];
    const position = userItems.findIndex(item => item === index) + 1;
    return `Try-On ${position}`;
  };

  const bgColor = isDarkMode ? '#0a0a0f' : '#f8fafc';
  const textColor = isDarkMode ? '#e4e4e7' : '#111827';
  const subText = isDarkMode ? '#a1a1aa' : '#6b7280';

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: '#8b5cf6',
          borderRadius: 12,
        },
      }}
    >
      <Layout className="gallery-layout" style={{ minHeight: '100vh', background: bgColor }}>
        {/* Header */}
        <Header className="gallery-header" style={{ background: isDarkMode ? 'rgba(10,10,15,0.95)' : 'rgba(248,250,252,0.95)' }}>
          <div className="header-content">
            <div className="header-left">
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                className="back-button"
              >
                Back
              </Button>
              <div className="logo-section">
                <PictureOutlined className="logo-icon" />
                <Title level={3} className="logo-text" style={{ margin: 0, color: textColor }}>
                  Virtual Try-On Gallery
                </Title>
              </div>
            </div>
            
            <div className="header-actions">
              <Space>
                <Button 
                  icon={<AppstoreOutlined />}
                  type={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button 
                  icon={<MenuOutlined />}
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
                <Button 
                  icon={<SortAscendingOutlined />}
                  onClick={() => setSortBy(sortBy === 'date' ? 'recent' : 'date')}
                >
                  Sort
                </Button>
              </Space>
            </div>
          </div>
        </Header>

        <Content className="gallery-content">
          {/* Hero Section */}
          <section className="gallery-hero-section">
            <div className="hero-background">
              <div className="hero-gradient"></div>
              <div className="hero-pattern"></div>
            </div>
            
            <div className="hero-content">
              <div className="hero-text">
                <div className="hero-badge">
                  <Tag color="purple" icon={<PictureOutlined />}>
                    PERSONAL GALLERY
                  </Tag>
                </div>
                <Title level={1} className="hero-title">
                  Welcome to Your{' '}
                  <span className="gradient-text">Virtual Try-On Gallery</span>
                </Title>
                <Paragraph className="hero-subtitle">
                  Explore all your virtual try-on sessions in one place. 
                  View, compare, and share your favorite outfits.
                </Paragraph>
                
                {username && (
                  <div className="user-info">
                    <Avatar size={64} icon={<UserOutlined />} className="user-avatar" />
                    <div className="user-details">
                      <Title level={4} style={{ margin: 0 }}>{username}'s Gallery</Title>
                      <Text type="secondary">Your personal fashion journey</Text>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="hero-stats">
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Card className="stat-card">
                      <Statistic
                        title="Total Try-Ons"
                        value={stats.totalTryOns}
                        prefix={<ExperimentOutlined />}
                        styles={{ content: { color: '#8b5cf6' } }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card className="stat-card">
                      <Statistic
                        title="Images"
                        value={stats.totalImages}
                        prefix={<PictureOutlined />}
                        styles={{ content: { color: '#10b981' } }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card className="stat-card">
                      <Statistic
                        title="Liked Items"
                        value={likedItems.length}
                        prefix={<HeartFilled />}
                        styles={{ content: { color: '#ef4444' } }}
                      />
                    </Card>
                  </Col>
                </Row>
              </div>
            </div>
          </section>

          {/* Gallery Content */}
          <section className="gallery-main-section">
            <div className="section-header">
              <Title level={2} className="section-title">
                <PictureOutlined style={{ marginRight: 12 }} />
                Your Try-On History
              </Title>
              <Paragraph className="section-subtitle">
                Browse through all your virtual try-on sessions
              </Paragraph>
            </div>

            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
                <Text style={{ marginTop: 16, display: 'block' }}>Loading your gallery...</Text>
              </div>
            ) : Object.keys(groupedData).length === 0 ? (
              <div className="empty-gallery">
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <Title level={4}>No Try-Ons Yet</Title>
                      <Paragraph style={{ color: subText }}>
                        Start creating virtual try-ons to see them appear here!
                      </Paragraph>
                      <Button 
                        type="primary" 
                        icon={<ExperimentOutlined />}
                        onClick={() => navigate('/try-on')}
                      >
                        Create Your First Try-On
                      </Button>
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="gallery-container">
                {Object.entries(groupedData).map(([user, items], userIndex) => {
                  const colorScheme = getUserColorScheme(userIndex);
                  const isCurrentUser = user === username;
                  
                  return (
                    <div 
                      key={user} 
                      className="user-section"
                      style={{
                        background: isDarkMode 
                          ? `linear-gradient(135deg, ${colorScheme.primary}15, transparent)`
                          : `linear-gradient(135deg, ${colorScheme.secondary}, ${colorScheme.secondary}30)`,
                        borderLeft: `4px solid ${colorScheme.primary}`,
                        borderRadius: '12px'
                      }}
                    >
                      {/* User Header */}
                      <div className="user-header">
                        <div className="user-header-left">
                          <Avatar 
                            style={{ 
                              backgroundColor: colorScheme.primary,
                              color: 'white'
                            }}
                            icon={<UserOutlined />}
                            size="large"
                          />
                          <div className="user-info">
                            <Title level={4} style={{ margin: 0 }}>
                              {isCurrentUser ? 'Your Try-Ons' : `${user}'s Try-Ons`}
                            </Title>
                            <Text type="secondary">
                              {items.length} session{items.length > 1 ? 's' : ''}
                            </Text>
                          </div>
                        </div>
                        <Tag color={colorScheme.primary} icon={<TeamOutlined />}>
                          {items.length} Items
                        </Tag>
                      </div>

                      {/* User's Try-On Items */}
                      <div className={`user-items ${viewMode}`}>
                        {items.map((item, itemIndex) => {
                          const itemKey = `${user}-${itemIndex}`;
                          const isLiked = likedItems.includes(itemKey);
                          
                          return (
                            <Card 
                              key={itemIndex}
                              className="tryon-item-card"
                              hoverable
                              style={{
                                border: `1px solid ${colorScheme.accent}`,
                                background: isDarkMode 
                                  ? 'rgba(255, 255, 255, 0.05)' 
                                  : 'white'
                              }}
                            >
                              {/* Card Header */}
                              <div className="card-header">
                                <div className="card-title">
                                  <Badge 
                                    color={colorScheme.primary}
                                    text={`Try-On #${itemIndex + 1}`}
                                  />
                                  <Text type="secondary" className="timestamp">
                                    <CalendarOutlined style={{ marginRight: 4 }} />
                                    {formatDate(item.createdat)}
                                  </Text>
                                </div>
                                <Button 
                                  type="text"
                                  icon={isLiked ? <HeartFilled style={{ color: '#ef4444' }} /> : <HeartOutlined />}
                                  onClick={() => handleLike(user, itemIndex)}
                                />
                              </div>

                              {/* Images Grid */}
                              <div className="images-grid">
                                {/* Person Image */}
                                <div className="image-container">
                                  <div className="image-label">
                                    <UserOutlined />
                                    <span>Model</span>
                                  </div>
                                  <div 
                                    className="image-wrapper"
                                    onClick={() => handleImageClick(item, user, itemIndex)}
                                  >
                                    <img 
                                      src={item.person_image_url} 
                                      alt="Person"
                                      className="gallery-image"
                                    />
                                    <div className="image-overlay">
                                      <EyeOutlined />
                                    </div>
                                  </div>
                                </div>

                                {/* Cloth Image */}
                                <div className="image-container">
                                  <div className="image-label">
                                    <ShoppingOutlined />
                                    <span>Garment</span>
                                  </div>
                                  <div 
                                    className="image-wrapper"
                                    onClick={() => handleImageClick(item, user, itemIndex)}
                                  >
                                    <img 
                                      src={item.cloth_image_path} 
                                      alt="Cloth"
                                      className="gallery-image"
                                    />
                                    <div className="image-overlay">
                                      <EyeOutlined />
                                    </div>
                                  </div>
                                </div>

                                {/* Output Image */}
                                <div className="image-container">
                                  <div className="image-label">
                                    <ExperimentOutlined />
                                    <span>Result</span>
                                  </div>
                                  <div 
                                    className="image-wrapper"
                                    onClick={() => handleImageClick(item, user, itemIndex)}
                                  >
                                    <img 
                                      src={item.output_image_path} 
                                      alt="Output"
                                      className="gallery-image"
                                    />
                                    <div className="image-overlay">
                                      <EyeOutlined />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Card Actions */}
                              <div className="card-actions">
                                <Space>
                                  <Button 
                                    size="small"
                                    icon={<DownloadOutlined />}
                                    onClick={() => handleDownload(item.output_image_path, 'result')}
                                  >
                                    Download
                                  </Button>
                                  <Button 
                                    size="small"
                                    icon={<ShareAltOutlined />}
                                    onClick={() => handleShare(item)}
                                  >
                                    Share
                                  </Button>
                                  <Button 
                                    size="small"
                                    icon={<EyeOutlined />}
                                    onClick={() => handleImageClick(item, user, itemIndex)}
                                  >
                                    View Details
                                  </Button>
                                </Space>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Timeline View (Alternative View) */}
          {!loading && Object.keys(groupedData).length > 0 && viewMode === 'list' && (
            <section className="timeline-section">
              <div className="section-header">
                <Title level={3} className="section-title">
                  Try-On Timeline
                </Title>
                <Paragraph className="section-subtitle">
                  View your try-ons in chronological order
                </Paragraph>
              </div>
              
              <Timeline mode="alternate" className="gallery-timeline">
                {galleryData.map((item, index) => (
                  <Timeline.Item 
                    key={index}
                    dot={
                      <Avatar 
                        style={{ backgroundColor: getUserColorScheme(index).primary }}
                        icon={<ExperimentOutlined />}
                      />
                    }
                  >
                    <Card className="timeline-card">
                      <div className="timeline-card-content">
                        <div className="timeline-images">
                          <img 
                            src={item.person_image_url} 
                            alt="Person" 
                            className="timeline-image"
                          />
                          <img 
                            src={item.cloth_image_path} 
                            alt="Cloth" 
                            className="timeline-image"
                          />
                          <img 
                            src={item.output_image_path} 
                            alt="Result" 
                            className="timeline-image"
                          />
                        </div>
                        <div className="timeline-info">
                          <Title level={5}>{item.username}</Title>
                          <Text type="secondary">{formatDate(item.createdat)}</Text>
                        </div>
                      </div>
                    </Card>
                  </Timeline.Item>
                ))}
              </Timeline>
            </section>
          )}
        </Content>

        {/* Image Preview Modal */}
        <Modal
          title="Image Preview"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          width={800}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              Close
            </Button>,
            <Button 
              key="download" 
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => selectedImage && handleDownload(selectedImage.output_image_path, 'selected')}
            >
              Download
            </Button>
          ]}
        >
          {selectedImage && (
            <div className="image-preview">
              <div className="preview-header">
                <Avatar 
                  style={{ backgroundColor: getUserColorScheme(0).primary }}
                  icon={<UserOutlined />}
                />
                <div className="preview-info">
                  <Title level={5}>{selectedImage.user}</Title>
                  <Text type="secondary">{formatDate(selectedImage.createdat)}</Text>
                </div>
              </div>
              
              <div className="preview-images">
                <div className="preview-image-container">
                  <Title level={5} style={{ textAlign: 'center' }}>
                    <UserOutlined /> Model Image
                  </Title>
                  <img 
                    src={selectedImage.person_image_url} 
                    alt="Person"
                    className="preview-image"
                  />
                </div>
                <div className="preview-image-container">
                  <Title level={5} style={{ textAlign: 'center' }}>
                    <ShoppingOutlined /> Garment Image
                  </Title>
                  <img 
                    src={selectedImage.cloth_image_path} 
                    alt="Cloth"
                    className="preview-image"
                  />
                </div>
                <div className="preview-image-container">
                  <Title level={5} style={{ textAlign: 'center' }}>
                    <ExperimentOutlined /> Result Image
                  </Title>
                  <img 
                    src={selectedImage.output_image_path} 
                    alt="Result"
                    className="preview-image"
                  />
                </div>
              </div>
            </div>
          )}
        </Modal>
      </Layout>
    </ConfigProvider>
  );
}

export default Gallery;