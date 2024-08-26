import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

interface FormData {
  userName: string;
  password: string;
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
  // batteryStatus: { level: number; charging: boolean; chargingTime: number };
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
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    userName: "",
    password: "",
  });

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
  });

  const startTime = useRef<Date>(new Date());
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

  const handleSubmit = (e: React.FormEvent) => {
    const timeOnPage =
      (new Date().getTime() - startTime.current.getTime()) / 1000;
    setUserBehaviorData((data) => ({
      ...data,
      timeOnPage,
    }));
    e.preventDefault();
    console.log(formData, userBehaviorData);
    axios
      .post(`${process.env.REACT_APP_BACKEND_URL}/api/v1/test`, {
        formData,
        userBehaviorData,
      })
      .then((response) => {
        console.log("Login successful", response.data);
      })
      .catch((error) => {
        console.error("Error during login", error);
      });
  };

  const handleForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((data) => ({
      ...data,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="max-w-[700px] flex flex-col justify-center items-center min-w-[250px] w-fit gap-3 border px-5 py-5 rounded-xl">
        <h1 className="text-4xl xs:text-2xl font-poppins">Login</h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center min-w-[250px] gap-3 text-xl xs:text-base"
        >
          <div className="flex flex-col">
            <label>User Name</label>
            <input
              type="text"
              onChange={handleForm}
              onFocus={handleFocus}
              onBlur={handleBlur}
              value={formData.userName}
              name="userName"
              placeholder="User Name"
              className="px-2 border py-1 rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label>Password</label>
            <input
              type="password"
              onChange={handleForm}
              onFocus={handleFocus}
              onBlur={handleBlur}
              value={formData.password}
              name="password"
              placeholder="Password"
              className="px-2 border py-1 rounded-md"
            />
          </div>

          <div className="w-full">
            <button
              type="submit"
              className="w-full px-4 py-2 border rounded-lg hover:bg-slate-100 duration-300"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
