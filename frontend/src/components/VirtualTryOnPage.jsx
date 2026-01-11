import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Select } from 'antd'; 
import {
  Layout,
  ConfigProvider,
  theme,
  Button,
  Typography,
  Space,
  Switch,
  Input,
  Row,
  Col,
  Divider,
  Card,
  Progress,
  Avatar,
  Statistic,
  Tag,
  Collapse,
  Tooltip,
  Steps,
  Timeline,
  Badge,
  Modal
} from "antd";
import {
  BulbOutlined,
  BulbFilled,
  UploadOutlined,
  SyncOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  ApiOutlined,
  MobileOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  HeartOutlined,
  HeartFilled,
  ShoppingCartOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  StarFilled,
  VideoCameraOutlined,
  PictureOutlined,
  SettingOutlined,
  RobotOutlined,
  ExperimentOutlined,
  CrownOutlined,
  RocketOutlined,
  TeamOutlined,
  GlobalOutlined,
  EditOutlined
} from "@ant-design/icons";

import ImageUpload from "./ImageUpload";
import Footer from './Footer';
import './VirtualTryOnPage.css';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { Step } = Steps;

// Main Try-On Page Component
function VirtualTryOnPage() {
  const [personImage, setPersonImage] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const [modelType, setModelType] = useState("");
  const [gender, setGender] = useState("");
  const [garmentType, setGarmentType] = useState("");
  const [style, setStyle] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("try-on");
  const [likedResults, setLikedResults] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [aiMode, setAiMode] = useState("balanced"); // balanced, quality, speed
  const [advancedSettings, setAdvancedSettings] = useState({
    lighting: "studio",
    pose: "natural",
    background: "neutral",
    fabricDetail: "high",
    bodyMeasurements: {}
  });

  const resultRef = useRef(null);
  const navigate = useNavigate();

  const { defaultAlgorithm, darkAlgorithm } = theme;

  // Initialize from localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Load user history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("tryOnHistory");
    const savedLikes = localStorage.getItem("likedResults");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedLikes) setLikedResults(JSON.parse(savedLikes));
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("tryOnHistory", JSON.stringify(history.slice(0, 20)));
    }
  }, [history]);

  // Scroll to result
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

  // Fade out animation
  useEffect(() => {
    if (!loading) {
      setFadeOut(true);
      setTimeout(() => setFadeOut(false), 500);
    } else {
      setFadeOut(false);
    }
  }, [loading]);

  // Progress animation
  useEffect(() => {
    if (loading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!personImage || !clothImage) {
      toast.error("Please upload both person and cloth images");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    const UserName = localStorage.getItem("UserName");
    
    formData.append("person_image", personImage);
    formData.append("cloth_image", clothImage);
    formData.append("instructions", instructions);
    formData.append("model_type", modelType);
    formData.append("gender", gender || "");
    formData.append("garment_type", garmentType || "");
    formData.append("style", style || "");
    formData.append("username", UserName);
    formData.append("ai_mode", aiMode);
    formData.append("lighting", advancedSettings.lighting);
    formData.append("pose", advancedSettings.pose);

    try {
      const response = await axios.post("http://localhost:8000/api/try-on", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newResult = {
        id: Date.now(),
        openaiImage: response.data.openai_image,
        externalImage: response.data.external_image,
        text: response.data.text,
        timestamp: new Date().toLocaleString(),
        modelType,
        garmentType,
        style,
        aiMode,
        likes: 0,
        shared: false
      };

      setResult(newResult);
      setHistory(prev => [newResult, ...prev]);
      toast.success("Virtual try-on completed successfully!");
      
      // Show tips modal for first-time users
      if (history.length === 0) {
        setTimeout(() => {
          Modal.info({
            title: "✨ Tips for Better Results",
            content: (
              <div>
                <p>• Use well-lit photos with clear contrast</p>
                <p>• Ensure garment is flat and visible</p>
                <p>• Try different angles for best fit</p>
                <p>• Use specific instructions for desired style</p>
              </div>
            ),
          });
        }, 1000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || "An error occurred during processing";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (id) => {
    setLikedResults(prev => {
      const newLikes = prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id];
      localStorage.setItem("likedResults", JSON.stringify(newLikes));
      return newLikes;
    });
  };

  const handleShare = (result) => {
    navigator.clipboard.writeText(`${window.location.origin}/result/${result.id}`);
    toast.success("Result link copied to clipboard!");
  };

  const handleDownload = (imageUrl, type) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `virtual-tryon-${type}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded ${type} result!`);
  };

  const handleClearHistory = () => {
    Modal.confirm({
      title: 'Clear History',
      content: 'Are you sure you want to clear all try-on history?',
      onOk: () => {
        setHistory([]);
        localStorage.removeItem("tryOnHistory");
        toast.success("History cleared!");
      }
    });
  };

  const viewHistoryDetail = (item) => {
    setSelectedHistory(item);
    setIsModalVisible(true);
  };

  const aiModes = [
    { value: "balanced", label: "Balanced", desc: "Good quality & speed" },
    { value: "quality", label: "High Quality", desc: "Best visual results" },
    { value: "speed", label: "Fast", desc: "Quickest processing" }
  ];

  const lightingOptions = [
    { value: "studio", label: "Studio Light" },
    { value: "natural", label: "Natural Light" },
    { value: "evening", label: "Evening Light" },
    { value: "indoor", label: "Indoor Light" }
  ];

  const poseOptions = [
    { value: "natural", label: "Natural Pose" },
    { value: "standing", label: "Standing" },
    { value: "walking", label: "Walking" },
    { value: "casual", label: "Casual" }
  ];

  const features = [
    {
      icon: <ThunderboltOutlined />,
      title: "AI-Powered",
      desc: "Dual AI engines for best results"
    },
    {
      icon: <SafetyOutlined />,
      title: "Secure",
      desc: "Your images are private"
    },
    {
      icon: <SyncOutlined />,
      title: "Real-time",
      desc: "Process in seconds"
    },
    {
      icon: <MobileOutlined />,
      title: "Mobile Ready",
      desc: "Works on all devices"
    }
  ];

  const stats = [
    { value: "99.2%", label: "Accuracy", icon: "🎯" },
    { value: "2.4s", label: "Avg Process", icon: "⚡" },
    { value: "50K+", label: "Try-Ons", icon: "👗" },
    { value: "4.9", label: "Rating", icon: "⭐" }
  ];

  const bgColor = isDarkMode ? "#0a0a0f" : "#f8fafc";
  const cardColor = isDarkMode ? "#1a1a2e" : "#ffffff";
  const textColor = isDarkMode ? "#e4e4e7" : "#111827";
  const subText = isDarkMode ? "#a1a1aa" : "#6b7280";
  const primaryColor = isDarkMode ? "#8b5cf6" : "#7c3aed";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: primaryColor,
          borderRadius: 12,
        },
      }}
    >
      <Layout className="virtual-tryon-layout" style={{ minHeight: "100vh", background: bgColor }}>
        {/* Header */}
        <Header className="virtual-header" style={{ background: isDarkMode ? "rgba(10,10,15,0.9)" : "rgba(248,250,252,0.9)" }}>
          <div className="header-content">
            <div className="header-left">
              <Button 
                type="text" 
                onClick={() => navigate('/')}
                className="back-button"
              >
                ← Back to Home
              </Button>
              <div className="logo-section">
                <RobotOutlined className="logo-icon" />
                <Title level={3} className="logo-text" style={{ margin: 0, color: textColor }}>
                  Virtual Try-On AI
                </Title>
              </div>
            </div>
            
            <div className="header-right">
              <Space size="middle">
                <Button 
                  type={activeTab === "try-on" ? "primary" : "text"}
                  onClick={() => setActiveTab("try-on")}
                  icon={<ExperimentOutlined />}
                >
                  Try On
                </Button>
                <Button
                  type="text"
                  onClick={() => navigate('/gallery')}
                  icon={<PictureOutlined />}
                >
                  Gallery
                </Button>
                <Switch
                  checked={isDarkMode}
                  onChange={setIsDarkMode}
                  checkedChildren={<BulbFilled />}
                  unCheckedChildren={<BulbOutlined />}
                  className="theme-switch"
                />
              </Space>
            </div>
          </div>
        </Header>

        <Content className="virtual-content">
          {/* Hero Section */}
          <section className="virtual-hero-section">
            <div className="hero-background">
              <div className="hero-gradient"></div>
              <div className="hero-particles"></div>
            </div>
            
            <div className="hero-content">
              <div className="hero-text">
                <div className="hero-badge">
                  <Tag color="purple" icon={<RocketOutlined />}>
                    AI-POWERED
                  </Tag>
                </div>
                <Title level={1} className="hero-title">
                  Try Clothes Virtually with{' '}
                  <span className="gradient-text">Advanced AI</span>
                </Title>
                <Paragraph className="hero-subtitle">
                  Upload your photo and garment, and see how it looks on you instantly. 
                  Powered by cutting-edge neural networks for realistic results.
                </Paragraph>
                
                <div className="hero-stats">
                  {stats.map((stat, index) => (
                    <div key={index} className="hero-stat-item">
                      <div className="stat-icon">{stat.icon}</div>
                      <div className="stat-content">
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="hero-visual">
                <div className="floating-fashion-card">
                  <div className="fashion-card-inner">
                    <div className="fashion-model"></div>
                    <div className="fashion-garment"></div>
                    <div className="fashion-sparkle"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section">
            <div className="section-header">
              <Title level={2} className="section-title">
                Why Choose Our Virtual Try-On
              </Title>
              <Paragraph className="section-subtitle">
                Experience the most advanced virtual fitting room technology
              </Paragraph>
            </div>
            
            <Row gutter={[24, 24]} className="features-grid">
              {features.map((feature, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Card className="feature-card" hoverable>
                    <div className="feature-icon-wrapper">
                      {feature.icon}
                    </div>
                    <Title level={4} className="feature-title">
                      {feature.title}
                    </Title>
                    <Paragraph className="feature-desc">
                      {feature.desc}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>

          {/* Main Try-On Interface */}
          {activeTab === "try-on" && (
            <section className="tryon-interface-section" id="try-on">
              <div className="section-header">
                <Title level={2} className="section-title">
                  Virtual Try-On Interface
                </Title>
                <Paragraph className="section-subtitle">
                  Upload your images and customize the settings for best results
                </Paragraph>
              </div>

              <div className="tryon-container">
                {/* AI Mode Selector */}
                <div className="ai-mode-selector">
                  <Title level={4} className="mode-title">
                    <SettingOutlined /> AI Processing Mode
                  </Title>
                  <div className="mode-buttons">
                    {aiModes.map(mode => (
                      <Button
                        key={mode.value}
                        type={aiMode === mode.value ? "primary" : "default"}
                        onClick={() => setAiMode(mode.value)}
                        className="mode-button"
                      >
                        <div className="mode-content">
                          <div className="mode-label">{mode.label}</div>
                          <div className="mode-desc">{mode.desc}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <Card className="tryon-card" style={{ background: cardColor }}>
                  <form onSubmit={handleSubmit}>
                    <Row gutter={[32, 32]}>
                      {/* Model Section */}
                      <Col xs={24} lg={12}>
                        <div className="upload-section">
                          <div className="section-header-inner">
                            <Avatar icon={<PictureOutlined />} className="section-icon" />
                            <div>
                              <Title level={4} style={{ color: textColor, margin: 0 }}>
                                Model Image
                              </Title>
                              <Text style={{ color: subText }}>Upload your photo or model image</Text>
                            </div>
                          </div>

                          <ImageUpload
                            label="Drag & drop or click to upload"
                            onImageChange={setPersonImage}
                            isDarkMode={isDarkMode}
                          />

                          <div className="settings-group">
                            <Title level={5} className="settings-title">
                              Model Settings
                            </Title>
                            <Row gutter={[16, 16]}>
                              <Col span={12}>
                                <div className="setting-item">
                                  <label>Model Type</label>
                                  <Select
                                    placeholder="Select type"
                                    style={{ width: "100%", marginTop: 8 }}
                                    value={modelType}
                                    onChange={setModelType}
                                    className="custom-select"
                                  >
                                    <Option value="top">Top Half</Option>
                                    <Option value="bottom">Bottom Half</Option>
                                    <Option value="full">Full Body</Option>
                                  </Select>
                                </div>
                              </Col>
                              <Col span={12}>
                                <div className="setting-item">
                                  <label>Gender</label>
                                  <Select
                                    placeholder="Select gender"
                                    style={{ width: "100%", marginTop: 8 }}
                                    value={gender}
                                    onChange={setGender}
                                    className="custom-select"
                                  >
                                    <Option value="male">Male</Option>
                                    <Option value="female">Female</Option>
                                    <Option value="unisex">Unisex</Option>
                                  </Select>
                                </div>
                              </Col>
                            </Row>
                          </div>
                        </div>
                      </Col>

                      {/* Garment Section */}
                      <Col xs={24} lg={12}>
                        <div className="upload-section">
                          <div className="section-header-inner">
                            <Avatar icon={<ShoppingCartOutlined />} className="section-icon" />
                            <div>
                              <Title level={4} style={{ color: textColor, margin: 0 }}>
                                Garment Image
                              </Title>
                              <Text style={{ color: subText }}>Upload the clothing item you want to try</Text>
                            </div>
                          </div>

                          <ImageUpload
                            label="Drag & drop or click to upload"
                            onImageChange={setClothImage}
                            isDarkMode={isDarkMode}
                          />

                          <div className="settings-group">
                            <Title level={5} className="settings-title">
                              Garment Settings
                            </Title>
                            <Row gutter={[16, 16]}>
                              <Col span={12}>
                                <div className="setting-item">
                                  <label>Garment Type</label>
                                  <Select
                                    placeholder="Select type"
                                    style={{ width: "100%", marginTop: 8 }}
                                    value={garmentType}
                                    onChange={setGarmentType}
                                    className="custom-select"
                                  >
                                    <Option value="shirt">Shirt</Option>
                                    <Option value="pants">Pants</Option>
                                    <Option value="jacket">Jacket</Option>
                                    <Option value="dress">Dress</Option>
                                    <Option value="tshirt">T-Shirt</Option>
                                  </Select>
                                </div>
                              </Col>
                              <Col span={12}>
                                <div className="setting-item">
                                  <label>Style</label>
                                  <Select
                                    placeholder="Select style"
                                    style={{ width: "100%", marginTop: 8 }}
                                    value={style}
                                    onChange={setStyle}
                                    className="custom-select"
                                  >
                                    <Option value="casual">Casual</Option>
                                    <Option value="formal">Formal</Option>
                                    <Option value="streetwear">Streetwear</Option>
                                    <Option value="sports">Sports</Option>
                                  </Select>
                                </div>
                              </Col>
                            </Row>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* Advanced Settings */}
                    <Collapse className="advanced-settings" ghost>
                      <Panel header={
                        <div className="panel-header">
                          <SettingOutlined />
                          <span>Advanced Settings</span>
                          <Tag color="blue">Optional</Tag>
                        </div>
                      } key="1">
                        <Row gutter={[24, 16]}>
                          <Col span={12}>
                            <div className="setting-item">
                              <label>Lighting</label>
                              <Select
                                value={advancedSettings.lighting}
                                onChange={value => setAdvancedSettings({...advancedSettings, lighting: value})}
                                style={{ width: "100%" }}
                              >
                                {lightingOptions.map(opt => (
                                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                                ))}
                              </Select>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div className="setting-item">
                              <label>Pose</label>
                              <Select
                                value={advancedSettings.pose}
                                onChange={value => setAdvancedSettings({...advancedSettings, pose: value})}
                                style={{ width: "100%" }}
                              >
                                {poseOptions.map(opt => (
                                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                                ))}
                              </Select>
                            </div>
                          </Col>
                        </Row>
                      </Panel>
                    </Collapse>

                    {/* Instructions */}
                    <div className="instructions-section">
                      <Title level={5} className="instructions-title">
                        <InfoCircleOutlined /> Special Instructions
                        <Tooltip title="Add specific details for better results">
                          <InfoCircleOutlined style={{ marginLeft: 8 }} />
                        </Tooltip>
                      </Title>
                      <Input.TextArea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows={4}
                        placeholder="e.g., Fit for walking pose, show side view, make it more fitted, adjust sleeve length..."
                        className="instructions-textarea"
                        maxLength={500}
                        showCount
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="submit-section">
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={loading}
                        icon={<ExperimentOutlined />}
                        className="submit-button"
                      >
                        {loading ? "Processing..." : "Generate Virtual Try-On"}
                      </Button>
                      
                      {loading && (
                        <div className="progress-indicator">
                          <Progress percent={progress} size="small" status="active" />
                          <Text style={{ color: subText, fontSize: 12 }}>Processing with {aiMode} mode...</Text>
                        </div>
                      )}
                    </div>
                  </form>
                </Card>
              </div>
            </section>
          )}

          {/* History Section */}
          {activeTab === "history" && (
            <section className="history-section">
              <div className="section-header">
                <Title level={2} className="section-title">
                  Try-On History
                </Title>
                <div className="history-actions">
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={() => toast.info("Export feature coming soon!")}
                  >
                    Export All
                  </Button>
                  <Button 
                    danger
                    icon={<HistoryOutlined />}
                    onClick={handleClearHistory}
                  >
                    Clear History
                  </Button>
                </div>
              </div>

              {history.length === 0 ? (
                <Card className="empty-history-card">
                  <div className="empty-state">
                    <HistoryOutlined className="empty-icon" />
                    <Title level={4}>No Try-On History Yet</Title>
                    <Paragraph style={{ color: subText }}>
                      Start your first virtual try-on to see results here!
                    </Paragraph>
                    <Button 
                      type="primary"
                      onClick={() => setActiveTab("try-on")}
                    >
                      Start Your First Try-On
                    </Button>
                  </div>
                </Card>
              ) : (
                <Row gutter={[24, 24]}>
                  {history.map((item) => (
                    <Col xs={24} sm={12} lg={8} key={item.id}>
                      <Card 
                        className="history-card"
                        hoverable
                        actions={[
                          <Tooltip title="Like">
                            <Button 
                              type="text" 
                              icon={likedResults.includes(item.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                              onClick={() => handleLike(item.id)}
                            />
                          </Tooltip>,
                          <Tooltip title="Share">
                            <Button 
                              type="text" 
                              icon={<ShareAltOutlined />}
                              onClick={() => handleShare(item)}
                            />
                          </Tooltip>,
                          <Tooltip title="Download">
                            <Button 
                              type="text" 
                              icon={<DownloadOutlined />}
                              onClick={() => handleDownload(item.openaiImage, 'openai')}
                            />
                          </Tooltip>,
                          <Tooltip title="View Details">
                            <Button 
                              type="text" 
                              icon={<EyeOutlined />}
                              onClick={() => viewHistoryDetail(item)}
                            />
                          </Tooltip>
                        ]}
                      >
                        <div className="history-card-content">
                          <div className="history-image-container">
                            <img 
                              src={item.openaiImage || item.externalImage} 
                              alt="Try-on result" 
                              className="history-image"
                            />
                            <div className="history-badge">
                              <Tag color="purple">{item.garmentType}</Tag>
                              <Tag color="blue">{item.style}</Tag>
                            </div>
                          </div>
                          
                          <div className="history-info">
                            <Text className="history-text">{item.text}</Text>
                            <div className="history-meta">
                              <Text type="secondary" className="history-time">
                                {item.timestamp}
                              </Text>
                              <Tag icon={<StarFilled />} color="gold">{item.aiMode}</Tag>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </section>
          )}

          {/* Results Section */}
          {result && (
            <section className="results-section" id="results" ref={resultRef}>
              <Divider />
              <div className="section-header">
                <Title level={2} className="section-title">
                  <CheckCircleOutlined style={{ marginRight: 12, color: '#10b981' }} />
                  Your Try-On Results
                </Title>
                <Paragraph className="section-subtitle">
                  Compare results from different AI engines
                </Paragraph>
              </div>

              <Row gutter={[32, 32]}>
                {result.openaiImage && (
                  <Col xs={24} lg={12}>
                    <Card className="result-card" hoverable>
                      <div className="result-card-header">
                        <Avatar icon={<RobotOutlined />} className="result-avatar" />
                        <div>
                          <Title level={4} style={{ margin: 0 }}>OpenAI DALL-E</Title>
                          <Text type="secondary">Creative & artistic results</Text>
                        </div>
                        <Button 
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownload(result.openaiImage, 'openai')}
                          className="download-button"
                        />
                      </div>
                      <div className="result-image-container">
                        <img 
                          src={result.openaiImage} 
                          alt="OpenAI Try-On Result" 
                          className="result-image"
                        />
                        <div className="result-overlay">
                          <Button 
                            type="primary" 
                            ghost
                            onClick={() => handleDownload(result.openaiImage, 'openai')}
                          >
                            Download
                          </Button>
                          <Button 
                            ghost
                            onClick={() => handleShare(result)}
                          >
                            Share
                          </Button>
                        </div>
                      </div>
                      <div className="result-stats">
                        <Row>
                          <Col span={8}>
                            <Statistic title="Quality" value={9.2} suffix="/10" />
                          </Col>
                          <Col span={8}>
                            <Statistic title="Realism" value={8.8} suffix="/10" />
                          </Col>
                          <Col span={8}>
                            <Statistic title="Fit" value={9.0} suffix="/10" />
                          </Col>
                        </Row>
                      </div>
                    </Card>
                  </Col>
                )}

                {result.externalImage && (
                  <Col xs={24} lg={12}>
                    <Card className="result-card" hoverable>
                      <div className="result-card-header">
                        <Avatar icon={<GlobalOutlined />} className="result-avatar" />
                        <div>
                          <Title level={4} style={{ margin: 0 }}>External AI Engine</Title>
                          <Text type="secondary">Realistic & accurate results</Text>
                        </div>
                        <Button 
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownload(result.externalImage, 'external')}
                          className="download-button"
                        />
                      </div>
                      <div className="result-image-container">
                        <img 
                          src={result.externalImage} 
                          alt="External Try-On Result" 
                          className="result-image"
                        />
                        <div className="result-overlay">
                          <Button 
                            type="primary" 
                            ghost
                            onClick={() => handleDownload(result.externalImage, 'external')}
                          >
                            Download
                          </Button>
                          <Button 
                            ghost
                            onClick={() => handleShare(result)}
                          >
                            Share
                          </Button>
                        </div>
                      </div>
                      <div className="result-stats">
                        <Row>
                          <Col span={8}>
                            <Statistic title="Accuracy" value={9.5} suffix="/10" />
                          </Col>
                          <Col span={8}>
                            <Statistic title="Detail" value={9.2} suffix="/10" />
                          </Col>
                          <Col span={8}>
                            <Statistic title="Speed" value={9.8} suffix="/10" />
                          </Col>
                        </Row>
                      </div>
                    </Card>
                  </Col>
                )}
              </Row>

              {/* Result Description */}
              <Card className="result-description-card">
                <div className="result-description-content">
                  <div className="result-text-section">
                    <Title level={5} style={{ marginBottom: 16 }}>
                      AI Analysis & Description
                    </Title>
                    <Paragraph style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                      {result.text}
                    </Paragraph>
                  </div>
                  <div className="result-tags">
                    <Tag icon={<ThunderboltOutlined />} color="cyan">AI-Powered</Tag>
                    <Tag icon={<SafetyOutlined />} color="green">Private</Tag>
                    <Tag icon={<SyncOutlined />} color="orange">Real-time</Tag>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="result-actions">
                <Space size="large">
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<ExperimentOutlined />}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setActiveTab('try-on');
                    }}
                  >
                    Try Another Outfit
                  </Button>
                  <Button 
                    size="large"
                    icon={<ShareAltOutlined />}
                    onClick={() => handleShare(result)}
                  >
                    Share Results
                  </Button>
                  <Button 
                    size="large"
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      handleDownload(result.openaiImage || result.externalImage, 'both');
                    }}
                  >
                    Download All
                  </Button>
                </Space>
              </div>
            </section>
          )}

          {/* Tips Section */}
          <section className="tips-section">
            <div className="section-header">
              <Title level={2} className="section-title">
                Tips for Best Results
              </Title>
              <Paragraph className="section-subtitle">
                Follow these guidelines for optimal virtual try-on experience
              </Paragraph>
            </div>
            
            <Timeline className="tips-timeline">
              <Timeline.Item dot={<PictureOutlined style={{ fontSize: '16px' }} />}>
                <Title level={5}>Use Clear Photos</Title>
                <Text>Upload high-quality, well-lit photos with good contrast</Text>
              </Timeline.Item>
              <Timeline.Item dot={<SettingOutlined style={{ fontSize: '16px' }} />}>
                <Title level={5}>Adjust Settings</Title>
                <Text>Select appropriate model type and garment type for better accuracy</Text>
              </Timeline.Item>
              <Timeline.Item dot={<EditOutlined style={{ fontSize: '16px' }} />}>
                <Title level={5}>Add Instructions</Title>
                <Text>Provide specific details like fit preference, angle, or style</Text>
              </Timeline.Item>
              <Timeline.Item dot={<ThunderboltOutlined style={{ fontSize: '16px' }} />}>
                <Title level={5}>Choose AI Mode</Title>
                <Text>Select quality mode for best results or speed mode for quick previews</Text>
              </Timeline.Item>
            </Timeline>
          </section>

          {/* Community Section */}
          <section className="community-section">
            <div className="section-header">
              <Title level={2} className="section-title">
                Join Our Fashion Community
              </Title>
              <Paragraph className="section-subtitle">
                Share your virtual try-ons and get inspired by others
              </Paragraph>
            </div>
            
            <Card className="community-card">
              <Row align="middle" gutter={[32, 32]}>
                <Col xs={24} md={12}>
                  <div className="community-content">
                    <Title level={3}>Share Your Style</Title>
                    <Paragraph>
                      Join thousands of fashion enthusiasts who are revolutionizing their shopping experience with virtual try-ons.
                    </Paragraph>
                    <ul className="community-features">
                      <li>✨ Get personalized recommendations</li>
                      <li>👗 Discover new styles from community</li>
                      <li>⭐ Rate and review try-on results</li>
                      <li>📱 Share on social media directly</li>
                    </ul>
                    <Button type="primary" size="large" icon={<TeamOutlined />}>
                      Join Community
                    </Button>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="community-stats">
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Statistic 
                          title="Active Users" 
                          value={15.3} 
                          suffix="K" 
                          prefix={<TeamOutlined />}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic 
                          title="Try-Ons Today" 
                          value={2.4} 
                          suffix="K" 
                          prefix={<ExperimentOutlined />}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic 
                          title="Avg Rating" 
                          value={4.8} 
                          suffix="/5" 
                          prefix={<StarFilled />}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic 
                          title="Styles Tried" 
                          value={45.7} 
                          suffix="K" 
                          prefix={<ShoppingCartOutlined />}
                        />
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </Card>
          </section>
        </Content>

        {/* Loading Overlay */}
        {(loading || fadeOut) && (
          <div className={`loading-overlay ${fadeOut ? 'fade-out' : ''}`}>
            <div className="loading-content">
              <div className="loading-spinner">
                <SyncOutlined spin style={{ fontSize: 48, color: primaryColor }} />
              </div>
              <div className="progress-container">
                <Progress percent={progress} status="active" strokeColor={primaryColor} />
                <Text className="loading-text">
                  Processing with AI... {progress}%
                </Text>
              </div>
              <Text className="loading-hint">
                This usually takes 15-30 seconds depending on image quality
              </Text>
            </div>
          </div>
        )}

        {/* History Detail Modal */}
        <Modal
          title="Try-On Details"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalVisible(false)}>
              Close
            </Button>,
            <Button 
              key="download" 
              type="primary"
              onClick={() => selectedHistory && handleDownload(selectedHistory.openaiImage, 'detail')}
            >
              Download Image
            </Button>
          ]}
          width={800}
        >
          {selectedHistory && (
            <div className="history-detail">
              <img 
                src={selectedHistory.openaiImage || selectedHistory.externalImage} 
                alt="Detail" 
                className="detail-image"
              />
              <div className="detail-info">
                <Title level={4}>Result Details</Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className="detail-item">
                      <label>Garment Type:</label>
                      <Text strong>{selectedHistory.garmentType}</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="detail-item">
                      <label>Style:</label>
                      <Text strong>{selectedHistory.style}</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="detail-item">
                      <label>AI Mode:</label>
                      <Tag color="purple">{selectedHistory.aiMode}</Tag>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="detail-item">
                      <label>Generated:</label>
                      <Text>{selectedHistory.timestamp}</Text>
                    </div>
                  </Col>
                </Row>
                <Divider />
                <div className="detail-description">
                  <label>AI Description:</label>
                  <Paragraph>{selectedHistory.text}</Paragraph>
                </div>
              </div>
            </div>
          )}
        </Modal>

        <Footer isDarkMode={isDarkMode} />
        <ToastContainer theme={isDarkMode ? "dark" : "light"} position="top-right" />
      </Layout>
    </ConfigProvider>
  );
}

export default VirtualTryOnPage;