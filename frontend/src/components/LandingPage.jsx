import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Space,
  Statistic,
  Timeline,
  Steps,
  Avatar,
  Badge,
  Tag,
  Progress,
  Divider,
  FloatButton
} from 'antd';
import {
  RocketOutlined,
  BulbOutlined,
  CloudSyncOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  ApiOutlined,
  MobileOutlined,
  CloudUploadOutlined,
  SyncOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
  GlobalOutlined,
  StarFilled,
  CheckCircleOutlined
} from '@ant-design/icons';
import './LandingPage.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const testimonialsRef = useRef(null);
  
  const features = [
    {
      icon: <BulbOutlined />,
      title: "AI-Powered Simulation",
      description: "Advanced neural networks create photorealistic clothing simulations with precise fabric dynamics and lighting."
    },
    {
      icon: <CloudSyncOutlined />,
      title: "Dual AI Engines",
      description: "Combines OpenAI's creative AI with specialized external models for maximum accuracy and creativity."
    },
    {
      icon: <ThunderboltOutlined />,
      title: "Real-Time Processing",
      description: "Process virtual try-ons in under 30 seconds with our optimized cloud infrastructure."
    },
    {
      icon: <SafetyOutlined />,
      title: "Secure & Private",
      description: "End-to-end encryption ensures your images and data remain completely confidential."
    },
    {
      icon: <ApiOutlined />,
      title: "RESTful API",
      description: "Integrate our try-on technology into your e-commerce platform with our developer-friendly API."
    },
    {
      icon: <MobileOutlined />,
      title: "Mobile Optimized",
      description: "Seamless experience across all devices with responsive design and mobile-first approach."
    }
  ];

  const steps = [
    {
      title: 'Upload',
      description: 'Upload model and garment images',
      icon: <CloudUploadOutlined />
    },
    {
      title: 'Configure',
      description: 'Set preferences and instructions',
      icon: <SyncOutlined />
    },
    {
      title: 'Process',
      description: 'AI generates virtual try-on',
      icon: <ThunderboltOutlined />
    },
    {
      title: 'Visualize',
      description: 'View and compare results',
      icon: <EyeOutlined />
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Fashion E-commerce CEO",
      content: "Increased our conversion rate by 45% and reduced returns by 60%. Revolutionary technology!",
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Tech Lead at FashionTech",
      content: "The dual AI approach produces results that are consistently more accurate than any single model.",
      avatar: "MR"
    },
    {
      name: "Priya Sharma",
      role: "Retail Innovation Director",
      content: "Our customers love the realism. The virtual try-on experience feels incredibly natural.",
      avatar: "PS"
    }
  ];

  const technologies = [
    { name: "OpenAI DALL-E", color: "#10B981" },
    { name: "TensorFlow", color: "#FF6B6B" },
    { name: "PyTorch", color: "#8B5CF6" },
    { name: "React Three Fiber", color: "#3B82F6" },
    { name: "FastAPI", color: "#EF4444" },
    { name: "Redis", color: "#DC2626" },
    { name: "Docker", color: "#2496ED" },
    { name: "AWS SageMaker", color: "#FF9900" }
  ];

  const stats = [
    { value: "99.8%", label: "Accuracy Rate", suffix: "+", icon: "🎯" },
    { value: "2.3s", label: "Avg Processing Time", suffix: "", icon: "⚡" },
    { value: "50K", label: "Daily Try-Ons", suffix: "+", icon: "👗" },
    { value: "4.8", label: "User Rating", suffix: "/5", icon: "⭐" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    navigate('/try-on');
  };

  return (
    <div className="landing-page">
      {/* Hero Section with 3D Background */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-background">
          <div className="particle-layer"></div>
          <div className="gradient-overlay"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <Tag color="blue" icon={<RocketOutlined />}>
              AI-POWERED
            </Tag>
          </div>
          
          <Title level={1} className="hero-title">
            Revolutionizing Fashion with{' '}
            <span className="gradient-text">AI Virtual Try-On</span>
          </Title>
          
          <Paragraph className="hero-subtitle">
            Experience the future of online shopping with our cutting-edge AI technology. 
            Try any clothing item virtually with photorealistic accuracy before you buy.
          </Paragraph>
          
          <Space size="large" className="hero-buttons">
            <Button 
              type="primary" 
              size="large" 
              icon={<ArrowRightOutlined />}
              onClick={handleGetStarted}
              className="cta-button"
            >
              Start Virtual Try-On
            </Button>
            <Button 
              size="large" 
              icon={<PlayCircleOutlined />}
              className="demo-button"
            >
              Watch Demo
            </Button>
          </Space>
          
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}<span className="stat-suffix">{stat.suffix}</span></div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 3D Model Preview */}
        <div className="model-preview">
          <div className="model-container">
            <div className="model-placeholder">
              <div className="model-rotate"></div>
              <div className="model-cloth"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" ref={featuresRef}>
        <div className="section-header">
          <Title level={2} className="section-title">
            Advanced Features That Set Us Apart
          </Title>
          <Paragraph className="section-subtitle">
            Powered by cutting-edge AI and computer vision technologies
          </Paragraph>
        </div>
        
        <Row gutter={[32, 32]} className="features-grid">
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card 
                hoverable 
                className="feature-card"
                style={{ 
                  transform: `translateY(${Math.sin(scrollY / 100 + index) * 10}px)`,
                  transition: 'transform 0.3s ease'
                }}
              >
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                </div>
                <Title level={4} className="feature-title">
                  {feature.title}
                </Title>
                <Paragraph className="feature-description">
                  {feature.description}
                </Paragraph>
                <div className="feature-glow"></div>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section" ref={howItWorksRef}>
        <div className="section-header">
          <Title level={2} className="section-title">
            How Our AI Technology Works
          </Title>
          <Paragraph className="section-subtitle">
            A seamless four-step process from upload to visualization
          </Paragraph>
        </div>
        
        <Steps current={-1} className="process-steps">
          {steps.map((step, index) => (
            <Step 
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>
        
        <div className="process-visualization">
          <div className="process-diagram">
            <div className="diagram-step upload-step">
              <div className="step-circle">1</div>
              <div className="step-image"></div>
              <Text strong>Image Upload</Text>
            </div>
            
            <div className="diagram-arrow">→</div>
            
            <div className="diagram-step process-step">
              <div className="step-circle">2</div>
              <div className="step-ai">🤖</div>
              <Text strong>AI Processing</Text>
            </div>
            
            <div className="diagram-arrow">→</div>
            
            <div className="diagram-step result-step">
              <div className="step-circle">3</div>
              <div className="step-result"></div>
              <Text strong>Result Generation</Text>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="tech-section">
        <div className="section-header">
          <Title level={2} className="section-title">
            Powered By Advanced Technology Stack
          </Title>
        </div>
        
        <div className="tech-cloud">
          {technologies.map((tech, index) => (
            <div 
              key={index} 
              className="tech-tag"
              style={{
                animationDelay: `${index * 0.1}s`,
                backgroundColor: tech.color
              }}
            >
              {tech.name}
            </div>
          ))}
        </div>
        
        <div className="tech-stats">
          <Row gutter={[24, 24]}>
            <Col xs={12} md={6}>
              <Statistic 
                title="AI Models" 
                value={12} 
                prefix={<BulbOutlined />}
                className="tech-stat"
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic 
                title="Processing Nodes" 
                value={256} 
                prefix={<CloudSyncOutlined />}
                className="tech-stat"
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic 
                title="Data Points" 
                value={10.5} 
                suffix="M" 
                prefix={<TeamOutlined />}
                className="tech-stat"
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic 
                title="Uptime" 
                value={99.9} 
                suffix="%" 
                prefix={<SafetyOutlined />}
                className="tech-stat"
              />
            </Col>
          </Row>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section" ref={testimonialsRef}>
        <div className="section-header">
          <Title level={2} className="section-title">
            Trusted by Industry Leaders
          </Title>
        </div>
        
        <Row gutter={[24, 24]} className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <Col xs={24} md={8} key={index}>
              <Card className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <StarFilled key={i} style={{ color: '#FFD700' }} />
                  ))}
                </div>
                <Paragraph className="testimonial-content">
                  "{testimonial.content}"
                </Paragraph>
                <div className="testimonial-author">
                  <Avatar size="large" className="author-avatar">
                    {testimonial.avatar}
                  </Avatar>
                  <div className="author-info">
                    <Text strong>{testimonial.name}</Text>
                    <Text type="secondary">{testimonial.role}</Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Use Cases */}
      <section className="usecases-section">
        <div className="section-header">
          <Title level={2} className="section-title">
            Transforming Multiple Industries
          </Title>
        </div>
        
        <div className="usecases-container">
          <Timeline mode="alternate" className="usecases-timeline">
            <Timeline.Item dot={<GlobalOutlined style={{ fontSize: '24px' }} />}>
              <Card title="E-commerce" className="usecase-card">
                <Paragraph>
                  Reduce return rates by 60% and increase conversion rates by 45% with virtual try-ons.
                </Paragraph>
                <Tag color="green">High ROI</Tag>
              </Card>
            </Timeline.Item>
            <Timeline.Item dot={<TrophyOutlined style={{ fontSize: '24px' }} />}>
              <Card title="Fashion Retail" className="usecase-card">
                <Paragraph>
                  Enable virtual fitting rooms and personalized style recommendations.
                </Paragraph>
                <Tag color="blue">Innovation</Tag>
              </Card>
            </Timeline.Item>
            <Timeline.Item dot={<TeamOutlined style={{ fontSize: '24px' }} />}>
              <Card title="Social Commerce" className="usecase-card">
                <Paragraph>
                  Power social shopping experiences with shareable virtual try-on results.
                </Paragraph>
                <Tag color="purple">Social Impact</Tag>
              </Card>
            </Timeline.Item>
          </Timeline>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-background">
          <div className="cta-gradient"></div>
        </div>
        
        <div className="cta-content">
          <Title level={2} className="cta-title">
            Ready to Transform Your Fashion Experience?
          </Title>
          <Paragraph className="cta-subtitle">
            Join thousands of satisfied users and businesses already using our platform.
          </Paragraph>
          
          <Space size="large" className="cta-buttons">
            <Button 
              type="primary" 
              size="large" 
              icon={<ArrowRightOutlined />}
              onClick={handleGetStarted}
              className="cta-main-button"
            >
              Start Free Trial
            </Button>
            <Button 
              size="large" 
              icon={<DownloadOutlined />}
              className="cta-secondary-button"
            >
              View Documentation
            </Button>
          </Space>
          
          <div className="cta-features">
            <Space size="middle">
              <Text>
                <CheckCircleOutlined /> No credit card required
              </Text>
              <Text>
                <CheckCircleOutlined /> 14-day free trial
              </Text>
              <Text>
                <CheckCircleOutlined /> 24/7 support
              </Text>
            </Space>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <FloatButton 
        type="primary" 
        icon={<ArrowRightOutlined />}
        onClick={handleGetStarted}
        tooltip="Get Started"
      />
    </div>
  );
}

export default LandingPage;