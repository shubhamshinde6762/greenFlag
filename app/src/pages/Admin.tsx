import React from "react";

interface DataType {
  key: string;
  loginId: string;
  x: number;
  y: number;
  z: number;
  w: number;
  result: string;
}

const data: DataType[] = [
  { key: "1", loginId: "001", x: 150, y: 2.4, z: 0.5, w: 38, result: "Human" },
  { key: "2", loginId: "002", x: 20, y: 0, z: 0, w: 1000, result: "Bot" },
  {
    key: "3",
    loginId: "003",
    x: 100,
    y: 3.17,
    z: 0.77,
    w: 70,
    result: "Human",
  },
];

const Admin: React.FC = () => {
  return (
    <div className="p-6 bg-white min-h-screen">
      <header className="bg-white p-4 rounded-md shadow-md mb-6">
        <h1 className="text-2xl font-semibold">Hello Admin</h1>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr>
              <th className="border-b-2 p-4 text-left text-lg">Login ID</th>
              <th className="border-b-2 p-4 text-left text-lg">
                Average Velocity
              </th>
              <th className="border-b-2 p-4 text-left text-lg">
                Average Acceleration
              </th>
              <th className="border-b-2 p-4 text-left text-lg">
                Angular Velocity
              </th>
              <th className="border-b-2 p-4 text-left text-lg">Typing Speed</th>
              <th className="border-b-2 p-4 text-left text-lg">Result</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.key} className="border-b">
                <td className="p-4">{row.loginId}</td>
                <td className="p-4">{row.x}</td>
                <td className="p-4">{row.y}</td>
                <td className="p-4">{row.z}</td>
                <td className="p-4">{row.w}</td>
                <td className="p-4">
                  <span
                    className={`inline-block rounded-lg py-1 px-3 text-center text-sm font-medium w-20 ${
                      row.result === "Human"
                        ? "bg-green-100 text-green-700 border border-green-500"
                        : "bg-red-100 text-red-700 border border-red-500"
                    }`}
                  >
                    {row.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
