import React, { useEffect, useState, useRef } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import axios from "axios";
import Lottie from "lottie-react";
import successAnimation from "../animations/icons8-check.json";
import { aadhar, loader, uidai, close, logo } from "../animations";
import { ConeIcon, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface FormData {
  aadharNumber: string;
  otp: string;
}

interface UserBehaviorData {
  cursorData: { x: number; y: number; timestamp: string }[];
  clickData: { element: string; x: number; y: number; timestamp: string }[];
  keystrokeData: { key: string; duration: number; keyPressDuration: number }[];
  scrollData: {
    scrollTop: number;
    scrollSpeed: number;
    direction: string;
    timestamp: string;
  }[];
  timeOnPage: number;
  formInteraction: { fieldName: string; timeSpent: number }[];
  hoverData: { element: string; duration: number }[];
  idleTime: number;
  windowFocusData: { focused: boolean; timestamp: string }[];
  deviceInfo: { deviceType: string; browser: string; os: string };
  copyPasteData: { action: string; field: string; timestamp: string }[];
  zoomLevel: number;
  resizeData: { width: number; height: number; timestamp: string }[];
  pageVisibility: { visible: boolean; timestamp: string }[];
  geoLocation: { latitude: number; longitude: number; accuracy: number };
  deviceOrientation: { alpha: number; beta: number; gamma: number };
  touchData: { x: number; y: number; pressure: number; timestamp: string }[];
  dragDropData: {
    element: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    timestamp: string;
  }[];
  browserFingerprint: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    aadharNumber: "",
    otp: "",
  });

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [internalState, setInternalState] = useState("pending");
  const [timeElapsed, setTimeElapsed] = useState(30);
  const [animationState, setAnimationState] = useState("verifying");
  const [showOTP, setShowOTP] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalState === "pending") {
        setAnimationState("success");
        setInternalState("success");
      } else if (internalState === "failure") {
        setAnimationState("failure");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [internalState]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (showOTP && timeElapsed > 0) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showOTP, timeElapsed]);

  const handleResendOTP = () => {
    setTimeElapsed(30); // Reset the timer to 30 seconds
    // Here you would typically call an API to resend the OTP
  };

  const handleGetOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (animationState === "verifying") {
      setInternalState("failure");
      setIsButtonDisabled(true);
    } else if (animationState === "success") {
      setShowOTP(true);
      // Here you would typically call an API to send the OTP
    }
  };

  const [userBehaviorData, setUserBehaviorData] = useState<UserBehaviorData>({
    cursorData: [],
    clickData: [],
    keystrokeData: [],
    scrollData: [],
    timeOnPage: 0,
    formInteraction: [],
    hoverData: [],
    idleTime: 0,
    windowFocusData: [],
    deviceInfo: {
      deviceType: navigator.userAgent.includes("Mobi") ? "mobile" : "desktop",
      browser: navigator.userAgent,
      os: navigator.platform,
    },
    copyPasteData: [],
    zoomLevel: window.devicePixelRatio,
    resizeData: [],
    pageVisibility: [
      {
        visible: document.visibilityState === "visible",
        timestamp: new Date().toISOString(),
      },
    ],
    geoLocation: { latitude: 0, longitude: 0, accuracy: 0 },
    deviceOrientation: { alpha: 0, beta: 0, gamma: 0 },
    touchData: [],
    dragDropData: [],
    browserFingerprint: "",
  });

  const startTime = useRef<number>(Date.now());
  const idleStart = useRef<number | null>(null);
  const lastScrollY = useRef<number>(0);
  const lastKeyPress = useRef<Date | null>(null);
  const [interactionStartTime, setInteractionStartTime] = useState<
    number | null
  >(null);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setInteractionStartTime(new Date().getTime());
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (interactionStartTime !== null) {
      const timeSpent = (new Date().getTime() - interactionStartTime) / 1000;
      setUserBehaviorData((data) => ({
        ...data,
        formInteraction: [
          ...data.formInteraction,
          {
            fieldName: e.target.name,
            timeSpent,
          },
        ],
      }));
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserBehaviorData((data) => ({
          ...data,
          geoLocation: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        }));
      });
    }

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      setUserBehaviorData((data) => ({
        ...data,
        deviceOrientation: {
          alpha: e.alpha || 0,
          beta: e.beta || 0,
          gamma: e.gamma || 0,
        },
      }));
    };

    const initFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setUserBehaviorData((prevData) => ({
        ...prevData,
        browserFingerprint: result.visitorId,
      }));
    };

    initFingerprint();

    window.addEventListener("deviceorientation", handleDeviceOrientation);

    const handleMouseMove = (e: MouseEvent) => {
      setUserBehaviorData((data) => ({
        ...data,
        cursorData: [
          ...data.cursorData,
          { x: e.clientX, y: e.clientY, timestamp: new Date().toISOString() },
        ],
      }));
    };

    const handleClick = (e: MouseEvent) => {
      setUserBehaviorData((data) => ({
        ...data,
        clickData: [
          ...data.clickData,
          {
            element: (e.target as HTMLElement).tagName,
            x: e.clientX,
            y: e.clientY,
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const start = new Date();
      lastKeyPress.current = start;
      const handleKeyUp = () => {
        const duration = new Date().getTime() - start.getTime();
        const keyPressDuration = lastKeyPress.current
          ? new Date().getTime() - lastKeyPress.current.getTime()
          : 0;
        setUserBehaviorData((data) => ({
          ...data,
          keystrokeData: [
            ...data.keystrokeData,
            { key: e.key, duration, keyPressDuration },
          ],
        }));
        window.removeEventListener("keyup", handleKeyUp);
      };
      window.addEventListener("keyup", handleKeyUp);
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollSpeed = Math.abs(scrollTop - lastScrollY.current);
      const direction = scrollTop > lastScrollY.current ? "down" : "up";
      lastScrollY.current = scrollTop;

      setUserBehaviorData((data) => ({
        ...data,
        scrollData: [
          ...data.scrollData,
          {
            scrollTop,
            scrollSpeed,
            direction,
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    };

    const handleIdleTime = () => {
      if (idleStart.current) {
        const idleTime = (new Date().getTime() - idleStart.current) / 1000;
        setUserBehaviorData((data) => ({
          ...data,
          idleTime: data.idleTime + idleTime,
        }));
      }
      idleStart.current = new Date().getTime();
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hoverStart = new Date();
      const handleHoverEnd = () => {
        const duration = new Date().getTime() - hoverStart.getTime();
        setUserBehaviorData((data) => ({
          ...data,
          hoverData: [...data.hoverData, { element: target.tagName, duration }],
        }));
        target.removeEventListener("mouseleave", handleHoverEnd);
      };
      target.addEventListener("mouseleave", handleHoverEnd);
    };

    const handleWindowFocus = (focused: boolean) => {
      setUserBehaviorData((data) => ({
        ...data,
        windowFocusData: [
          ...data.windowFocusData,
          { focused, timestamp: new Date().toISOString() },
        ],
      }));
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      const action = e.type === "copy" ? "copy" : "paste";
      const field = (e.target as HTMLInputElement).name;
      setUserBehaviorData((data) => ({
        ...data,
        copyPasteData: [
          ...data.copyPasteData,
          { action, field, timestamp: new Date().toISOString() },
        ],
      }));
    };

    const handleResize = () => {
      setUserBehaviorData((data) => ({
        ...data,
        resizeData: [
          ...data.resizeData,
          {
            width: window.innerWidth,
            height: window.innerHeight,
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    };

    const handlePageVisibility = () => {
      setUserBehaviorData((data) => ({
        ...data,
        pageVisibility: [
          ...data.pageVisibility,
          {
            visible: document.visibilityState === "visible",
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("focus", () => handleWindowFocus(true));
    window.addEventListener("blur", () => handleWindowFocus(false));
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handlePageVisibility);
    document.addEventListener("mouseover", handleHover);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);

    const idleInterval = setInterval(handleIdleTime, 1000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("focus", () => handleWindowFocus(true));
      window.removeEventListener("blur", () => handleWindowFocus(false));
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handlePageVisibility);
      document.removeEventListener("mouseover", handleHover);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      clearInterval(idleInterval);
    };
  }, []);

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // const timeOnPage = (Date.now() - startTime.current) / 1000;
    setUserBehaviorData((data) => ({
      ...data,
      timeOnPage  : data.idleTime,
    }));

    console.log(formData, userBehaviorData);
    axios
      .post(`${process.env.REACT_APP_BACKEND_URL}/verify`, {
        formData,
        userBehaviorData,
      })
      .then((response) => {
        console.log("OTP verification successful", response.data);
        // Handle successful login here
      })
      .catch((error) => {
        console.error("Error during OTP verification", error);
        // Handle error here
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.split(" ").filter(Boolean).join("");

    if (
      !/^\d*$/.test(val) ||
      (e.target.name === "aadharNumber" && val.length > 12)
    ) {
      return;
    }

    const formattedValue =
      e.target.name === "aadharNumber"
        ? val.replace(/(\d{4})(?=\d)/g, "$1 ")
        : val;

    setFormData((data) => ({
      ...data,
      [e.target.name]: formattedValue,
    }));
  };

  return (
    <motion.div
      className="w-full flex flex-col items-center justify-center min-h-screen bg-gray-100 font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-0 left-0 sx:block w-full">
        <div className="flex w-full p-4 items-center justify-between">
          <motion.img
            src={uidai}
            alt="UIDAI Logo"
            className="h-14 xs:h-9 w-auto"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <motion.img
            src={aadhar}
            alt="Aadhar Logo"
            className="h-14 xs:h-9 w-auto"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      <motion.div
        className="flex gap-8 sx:flex-wrap items-center justify-center w-full"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img src={aadhar} className="w-[40%] min-w-[250px] max-w-[500px]" />
        <motion.div
          className="max-w-md w-full space-y-8 bg-white p-10 xs:p-5 rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="text-center text-3xl sx:text-2xl font-extrabold text-gray-900">
              Login to your Aadhar
            </h2>
            <p className="my-2 text-center text-sm text-gray-600">
              Secure access to your Aadhar account
            </p>
          </div>
          <form
            className="space-y-2"
            onSubmit={showOTP ? handleOTPSubmit : handleGetOTP}
          >
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <motion.input
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Aadhar Number"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  whileFocus={{ scale: 1.05 }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center gap-2">
                {animationState === "verifying" && (
                  <motion.div
                    className="animate-spin h-5 w-5 mr-3"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Loader2 />
                  </motion.div>
                )}
                {animationState === "success" && (
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Lottie
                      animationData={successAnimation}
                      loop={false}
                      style={{ width: 30, height: 30 }}
                    />
                  </motion.div>
                )}
                {animationState === "failure" && (
                  <motion.img
                    src={close}
                    alt="Failure"
                    className="h-5 w-5 mr-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span className="text-md xs:text-sm">
                  {animationState === "verifying" && "Verifying..."}
                  {animationState === "success" && "Verified!"}
                  {animationState === "failure" && "Verification failed"}
                </span>
              </div>
              <img src={logo} alt="Logo" className="h-10   w-auto" />
            </div>

            {showOTP && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <label htmlFor="otp" className="sr-only">
                  OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter 6 digit OTP"
                  value={formData.otp}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <p className="mt-2 text-sm text-gray-600">
                  {timeElapsed > 0 ? (
                    `Resend OTP in ${timeElapsed} seconds`
                  ) : (
                    <span
                      className="text-indigo-600 hover:text-indigo-500 cursor-pointer"
                      onClick={handleResendOTP}
                    >
                      Resend OTP
                    </span>
                  )}
                </p>
              </motion.div>
            )}

            <motion.div whileTap={{ scale: 0.95 }}>
              <button
                type="submit"
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  animationState === "failure"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                }`}
                disabled={animationState === "failure"}
              >
                {showOTP ? "Verify OTP" : "Get OTP"}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
