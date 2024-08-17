import React, { useEffect, useState } from "react";
import axios from "axios";

interface FormData {
  userName: string;
  password: string;
}

interface CursorData {
  x: number;
  y: number;
  timestamp: string;
} 

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    userName: "",
    password: "",
  });

  const [cursorData, setCursorData] = useState<CursorData[]>([]);

  const handleMouseMove = (e: MouseEvent) => {
    setCursorData((data) => [
      ...data,
      {
        x: e.clientX,
        y: e.clientY,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((data) => ({
      ...data,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("Form submitted:", formData);

    const csvData = cursorData
      .map((item) => `${item.timestamp},${item.x},${item.y}`)
      .join("\n");

    const payload = {
      ...formData,
      cursorData: csvData,
    };

    console.log(payload)

    // try {
    //   const response = await axios.post("/api/v1/test", payload);
    //   console.log("Response from server:", response.data);
    // } catch (error) {
    //   console.error("Error submitting form:", error);
    // }
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
              name="password"
              value={formData.password}
              placeholder="Password"
              className="px-2 border py-1 rounded-md"
            />
          </div>
          <button
            type="submit"
            className="px-2 py-1 border cursor-pointer hover:bg-green-600 text-white bg-green-500 transition-all duration-300 w-fit rounded-md text-xl"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
