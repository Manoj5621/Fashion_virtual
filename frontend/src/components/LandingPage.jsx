import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
  Divider
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
import img1 from '../assets/design/1.jpg';
import img2 from '../assets/design/2.jpg';
import img3 from '../assets/design/3.jpg';
import img4 from '../assets/design/4.jpg';
import img5 from '../assets/design/5.jpg';
import img6 from '../assets/design/6.jpg';
import img7 from '../assets/design/7.jpg';
import demoVideo from '../assets/design/demo.mp4';
import bgVideo from '../assets/design/9.mp4';
import aiVirtualTryVideo from '../assets/design/AI_Virtual_Try.mp4';
import './LandingPage.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const testimonialsRef = useRef(null);
  const techRef = useRef(null);
  const usecasesRef = useRef(null);
  const ctaRef = useRef(null);
  
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

  const images = [img1, img2, img3, img4, img5, img6, img7];

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

  useEffect(() => {
    const changeImage = () => {
      setIsTransitioning(true);
      setNextImageIndex((currentImageIndex + 1) % images.length);
      setTimeout(() => {
        setCurrentImageIndex(nextImageIndex);
        setIsTransitioning(false);
      }, 2000);
    };
    const interval = setInterval(changeImage, 6000);
    return () => clearInterval(interval);
  }, [images.length, currentImageIndex, nextImageIndex]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const sections = [featuresRef.current, howItWorksRef.current, techRef.current, usecasesRef.current, ctaRef.current];
    sections.forEach(section => {
      if (section) {
        gsap.set(section, { opacity: 0, y: 50 });
        gsap.to(section, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        });
      }
    });
  }, []);

  const handleGetStarted = () => {
    navigate('/try-on');
  };

  return (
    <div className="landing-page">
      <section className="hero-section" ref={heroRef}>
        <div className="hero-background">
          <div className="bg-layer current" style={{ backgroundImage: `url(${images[currentImageIndex]})`, opacity: isTransitioning ? 0 : 1, filter: isTransitioning ? 'blur(5px)' : 'blur(0px)', transform: isTransitioning ? 'rotate(2deg) scale(0.98) skew(3deg, 1deg)' : 'rotate(0deg) scale(1) skew(0deg, 0deg)' }}></div>
          <div className="bg-layer next" style={{ backgroundImage: `url(${images[nextImageIndex]})`, opacity: isTransitioning ? 1 : 0, filter: 'blur(0px)', transform: isTransitioning ? 'rotate(0deg) scale(1) skew(0deg, 0deg)' : 'rotate(-2deg) scale(0.95) skew(-3deg, -1deg)' }}></div>
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

        <video src={aiVirtualTryVideo} autoPlay loop muted playsInline controls={false} style={{ width: '100%', height: 'auto', marginBottom: '32px' }} />

        <Paragraph className="section-description">
          Experience the power of AI-driven virtual try-on technology. Our platform combines cutting-edge computer vision and deep learning models to create photorealistic clothing simulations. Watch the demo above to see how seamlessly our system transforms fashion shopping by allowing users to visualize garments on their own bodies before making a purchase.
        </Paragraph>
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
        
        <video src={demoVideo} autoPlay loop muted playsInline controls={false} style={{ width: '100%', height: 'auto' }} />
      </section>

      {/* Technology Stack */}
      <section className="tech-section" ref={techRef}>
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
        
     </section>

            {/* Use Cases */}
      <section className="usecases-section" ref={usecasesRef}>
        <video className="usecases-video" autoPlay loop muted playsInline>
          <source src={bgVideo} type="video/mp4" />
        </video>
        <div className="usecases-content">
          <div className="section-header">
            <Title level={2} className="section-title rainbow-text">
              Transforming Multiple Industries
            </Title>
          </div>
          
          <div className="usecases-container">
            <Paragraph style={{ color: 'black', textShadow: '2px 2px 4px rgba(255,255,255,0.8)', fontSize: '1.2rem', marginBottom: '24px' }}>
              Our AI-powered virtual try-on technology is revolutionizing multiple industries by providing immersive, photorealistic simulations that bridge the gap between online browsing and real-life experiences.
            </Paragraph>
            <Paragraph style={{ color: 'black', textShadow: '2px 2px 4px rgba(255,255,255,0.8)', fontSize: '1.2rem', marginBottom: '24px' }}>
              In e-commerce, it dramatically reduces return rates by enabling customers to visualize products accurately, leading to higher conversion rates and improved customer satisfaction across platforms.
            </Paragraph>
            <Paragraph style={{ color: 'black', textShadow: '2px 2px 4px rgba(255,255,255,0.8)', fontSize: '1.2rem', marginBottom: '24px' }}>
              Fashion retailers leverage virtual fitting rooms for enhanced shopping experiences, while social commerce platforms benefit from shareable try-on results that boost user engagement and drive viral marketing.
            </Paragraph>
            <Paragraph style={{ color: 'black', textShadow: '2px 2px 4px rgba(255,255,255,0.8)', fontSize: '1.2rem', marginBottom: '24px' }}>
              Beyond fashion, this technology extends to furniture, accessories, and other product categories, transforming how consumers interact with digital commerce and revolutionizing retail experiences across various sectors.
            </Paragraph>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" ref={ctaRef}>
        <div className="cta-background">
          <div className="cta-gradient"></div>
          <div className="fashion-dress-1"></div>
          <div className="fashion-dress-2"></div>
          <div className="fashion-dress-3"></div>
          <div className="fashion-fabric-pattern"></div>
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
    </div>
  );
}

export default LandingPage;