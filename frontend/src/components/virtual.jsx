import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom"; // Added imports
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
} from "antd";
import {
  BulbOutlined,
  BulbFilled,
  GithubOutlined,
  LinkedinOutlined,
  UserOutlined,
  ShopOutlined,
} from "@ant-design/icons";

import ImageUpload from "./ImageUpload";
import Footer from './Footer';
import LandingPage from "./LandingPage"; // Added import
const bgVideo = '/design/8.mp4';

const { Header, Content} = Layout;
const { Title, Text } = Typography;

// Main Try-On Page Component
function TryOnPage() {
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

  const { Option } = Select;

  const resultRef = useRef(null);
  const navigate = useNavigate(); // Added navigate

  const { defaultAlgorithm, darkAlgorithm } = theme;

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

  useEffect(() => {
    if (!loading) {
      setFadeOut(true);
      setTimeout(() => setFadeOut(false), 500);
    } else {
      setFadeOut(false);
    }
  }, [loading]);

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
    formData.append("person_image", personImage);
    formData.append("cloth_image", clothImage);
    formData.append("instructions", instructions);
    
    // Add dropdown values to form data
    formData.append("model_type", modelType || "");
    formData.append("gender", gender || "");
    formData.append("garment_type", garmentType || "");
    formData.append("style", style || "");

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
      };

      setResult(newResult);
      setHistory((prev) => [newResult, ...prev]);
      toast.success("Virtual try-on completed successfully!");
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || "An error occurred during processing";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const bgColor = isDarkMode ? "#0f0f0f" : "#f9fafb";
  const cardColor = isDarkMode ? "#1c1c1c" : "#ffffff";
  const textColor = isDarkMode ? "#e4e4e4" : "#111827";
  const subText = isDarkMode ? "#9ca3af" : "#4b5563";

  const loaderStyles = `
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      background: rgba(255,255,255,0.1);
      transition: opacity 0.5s ease;
    }
    .loading-overlay.fade-out {
      opacity: 0;
    }
    .loading-content {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 20px;
      padding: 40px 50px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
      text-align: center;
      perspective: 1000px;
    }
    .progress-container {
      width: 100%;
      max-width: 300px;
      margin: 0 auto 20px;
    }
    .progress-bar {
      width: 100%;
      height: 20px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .progress-fill {
      height: 100%;
      background: #10b981;
      border-radius: 10px;
      transition: width 0.1s ease;
    }
    p {
      color: #111827;
    }
  `;

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: loaderStyles }} />
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: "#0ea5e9",
          borderRadius: 10,
        },
      }}
    >
      <Layout style={{ minHeight: "100vh", background: bgColor }}>
        <Header
          style={{
            background: "transparent",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.5rem 2rem",
          }}
        >
          <Space>
            <Button
              type="text"
              onClick={() => navigate('/')} // Added navigation to landing page
              style={{ color: 'black' }}
            >
              ← Back to Home
            </Button>
            <Title level={3} style={{ margin: 0, color: textColor }}>
              👗 Virtual Try-On
            </Title>
          </Space>
          <Switch
            checked={isDarkMode}
            onChange={setIsDarkMode}
            checkedChildren={<BulbFilled />}
            unCheckedChildren={<BulbOutlined />}
          />
        </Header>
        <Content style={{ padding: "2rem 1rem", position: 'relative' }}>
          <video
            src={bgVideo}
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: -1,
            }}
            disablePictureInPicture
            controls={false}
            preload="auto"
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)',
            zIndex: -1
          }} />
          <div className="max-w-5xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
            <Title
              level={1}
              className="text-center"
              style={{ color: textColor, marginBottom: 40 }}
            >
              Try-On Clothes in Seconds
            </Title>

            <div style={{ background: cardColor, padding: 40, borderRadius: 16, boxShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.1)', marginBottom: 40 }}>
              <form onSubmit={handleSubmit}>
              <Row gutter={[24, 24]}>
                {/* Model Section */}
                <Col xs={24} md={12}>
                  <div
                    style={{
                      background: cardColor,
                      padding: 24,
                      borderRadius: 12,
                    }}
                  >
                    <Title
                      level={4}
                      style={{ color: textColor, marginBottom: 16 }}
                    >
                      <UserOutlined style={{ marginRight: 8, color: textColor }} /> Model Image
                    </Title>

                    <ImageUpload
                      label="Upload Model Image"
                      onImageChange={setPersonImage}
                      isDarkMode={isDarkMode}
                    />

                    <div className="mt-6 space-y-4">
                      {/* Model Type */}
                      <div>
                        <Text style={{ color: subText }}>Model Type</Text>
                        <Select
                          placeholder="Select model type"
                          style={{ width: "100%", marginTop: 4 }}
                          value={modelType}
                          onChange={setModelType}
                        >
                          <Option value="top">Top Half</Option>
                          <Option value="bottom">Bottom Half</Option>
                          <Option value="full">Full Body</Option>
                        </Select>
                      </div>

                      {/* Gender */}
                      <div>
                        <Text style={{ color: subText }}>Gender</Text>
                        <Select
                          placeholder="Select gender"
                          style={{ width: "100%", marginTop: 4 }}
                          value={gender}
                          onChange={setGender}
                        >
                          <Option value="male">Male</Option>
                          <Option value="female">Female</Option>
                          <Option value="unisex">Unisex</Option>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Garment Section */}
                <Col xs={24} md={12}>
                  <div
                    style={{
                      background: cardColor,
                      padding: 24,
                      borderRadius: 12,
                    }}
                  >
                    <Title
                      level={4}
                      style={{ color: textColor, marginBottom: 16 }}
                    >
                      <ShopOutlined style={{ marginRight: 8, color: textColor }} /> Garment Image
                    </Title>

                    <ImageUpload
                      label="Upload Cloth Image"
                      onImageChange={setClothImage}
                      isDarkMode={isDarkMode}
                    />

                    <div className="mt-6 space-y-4">
                      {/* Garment Type */}
                      <div>
                        <Text style={{ color: subText }}>Garment Type</Text>
                        <Select
                          placeholder="Select garment type"
                          style={{ width: "100%", marginTop: 4 }}
                          value={garmentType}
                          onChange={setGarmentType}
                        >
                          <Option value="shirt">Shirt</Option>
                          <Option value="pants">Pants</Option>
                          <Option value="jacket">Jacket</Option>
                          <Option value="dress">Dress</Option>
                          <Option value="tshirt">T-shirt</Option>
                        </Select>
                      </div>

                      {/* Style */}
                      <div>
                        <Text style={{ color: subText }}>Style</Text>
                        <Select
                          placeholder="Select style"
                          style={{ width: "100%", marginTop: 4 }}
                          value={style}
                          onChange={setStyle}
                        >
                          <Option value="casual">Casual</Option>
                          <Option value="formal">Formal</Option>
                          <Option value="streetwear">Streetwear</Option>
                          <Option value="traditional">Traditional</Option>
                          <Option value="sports">Sportswear</Option>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Instructions */}
              <div style={{ marginTop: "2.5rem" }}>
                <Title
                  level={5}
                  style={{ color: textColor, marginBottom: "0.5rem" }}
                >
                  Special Instructions
                </Title>
                <Input.TextArea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                  placeholder="e.g. Fit for walking pose, crop top, side view preferred..."
                  style={{
                    borderRadius: 10,
                    padding: "1rem",
                    fontSize: "1rem",
                    backgroundColor: isDarkMode ? "#1f1f1f" : "#ffffff",
                    color: textColor,
                    borderColor: isDarkMode ? "#333" : "#d1d5db",
                  }}
                />
              </div>

              {/* Submit Button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "3rem",
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    height: 48,
                    width: 200,
                    fontSize: 16,
                    borderRadius: 8,
                  }}
                >
                  {loading ? "Processing..." : "Try On"}
                </Button>
              </div>
            </form>
            </div>

            {result && (
              <div ref={resultRef} className="mt-20">
                <Divider />
                <Title
                  level={3}
                  style={{
                    color: textColor,
                    textAlign: "center",
                    marginBottom: 32,
                  }}
                >
                  Your Try-On Results
                </Title>
                <Row gutter={[32, 32]}>
                  {result.openaiImage && (
                    <Col xs={24} md={12}>
                      <div
                        style={{
                          background: cardColor,
                          padding: 24,
                          borderRadius: 16,
                          textAlign: "center",
                        }}
                      >
                        <Title
                          level={4}
                          style={{ color: textColor, marginBottom: 16 }}
                        >
                          OpenAI Virtual Try-On
                        </Title>
                        <img
                          src={result.openaiImage}
                          alt="OpenAI Try-On Result"
                          style={{
                            borderRadius: 12,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                            maxHeight: 400,
                            width: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </Col>
                  )}
                  {result.externalImage && (
                    <Col xs={24} md={12}>
                      <div
                        style={{
                          background: cardColor,
                          padding: 24,
                          borderRadius: 16,
                          textAlign: "center",
                        }}
                      >
                        <Title
                          level={4}
                          style={{ color: textColor, marginBottom: 16 }}
                        >
                          External Virtual Try-On
                        </Title>
                        <img
                          src={result.externalImage}
                          alt="External Try-On Result"
                          style={{
                            borderRadius: 12,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                            maxHeight: 400,
                            width: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </Col>
                  )}
                </Row>
                <Text
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: 24,
                    color: isDarkMode ? "#ffffff" : "#000000",
                    fontSize: "1.25rem",
                    fontWeight: "600"
                  }}
                >
                  {result.text}
                </Text>
              </div>
            )}

            {history.length > 0 && (
              <div className="mt-24">
                <Divider />
                <Title level={3} style={{ color: textColor, marginBottom: 32 }}>
                  Previous Results
                </Title>
                <Row gutter={[24, 24]}>
                  {history.map((item) => (
                    <Col xs={24} sm={12} md={8} key={item.id}>
                      <div
                        style={{
                          background: cardColor,
                          padding: 16,
                          borderRadius: 12,
                        }}
                      >
                        <div className="space-y-4">
                          {item.openaiImage && (
                            <div>
                              <Text
                                style={{
                                  display: "block",
                                  color: isDarkMode ? "#38bdf8" : "#1677ff",
                                  fontSize: 12,
                                  fontWeight: "600",
                                  marginBottom: 8,
                                }}
                              >
                                OpenAI
                              </Text>
                              <img
                                src={item.openaiImage}
                                alt="OpenAI Previous"
                                style={{
                                  width: "100%",
                                  borderRadius: 8,
                                  marginBottom: 8,
                                }}
                              />
                            </div>
                          )}
                          {item.externalImage && (
                            <div>
                              <Text
                                style={{
                                  display: "block",
                                  color: isDarkMode ? "#34d399" : "#10b981",
                                  fontSize: 12,
                                  fontWeight: "600",
                                  marginBottom: 8,
                                }}
                              >
                                External
                              </Text>
                              <img
                                src={item.externalImage}
                                alt="External Previous"
                                style={{
                                  width: "100%",
                                  borderRadius: 8,
                                  marginBottom: 8,
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <Text
                          style={{
                            display: "block",
                            color: isDarkMode ? "#ffffff" : "#000000",
                            fontSize: "1rem",
                            fontWeight: "600",
                            marginBottom: 4,
                          }}
                        >
                          {item.text}
                        </Text>
                        <Text
                          style={{
                            color: isDarkMode ? "#777" : "#666",
                            fontSize: 12,
                          }}
                        >
                          {item.timestamp}
                        </Text>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </div>
          {(loading || fadeOut) && (
            <div className={`loading-overlay ${fadeOut ? 'fade-out' : ''}`}>
              <div className="loading-content">
                <div className="progress-container">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p style={{ textAlign: 'center', marginTop: '10px' }}>{progress}%</p>
                </div>
                <p>Processing virtual try-on...</p>
              </div>
            </div>
          )}
        </Content>

        <Footer isDarkMode={isDarkMode} />

        <ToastContainer theme={isDarkMode ? "dark" : "light"} />
      </Layout>
    </ConfigProvider>
    </>
  );
}

// Updated VirtualApp Component with Routing
function VirtualApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/try-on" element={<TryOnPage />} />
      </Routes>
    </Router>
  );
}

export default VirtualApp;
export { TryOnPage };