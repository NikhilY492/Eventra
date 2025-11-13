import AdminSidebar from "./layout/AdminSidebar";
import AdminTopbar from "./layout/AdminTopbar";
import { Calendar, Users, DollarSign, Clock } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="ml-64 flex-1 bg-gray-50 min-h-screen">
        <AdminTopbar />

        <main className="p-8 space-y-6">
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-100 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <Calendar className="text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold mt-2 text-blue-900">3</h2>
              <p className="text-xs text-green-600 mt-1">+2 from last month</p>
            </div>

            <div className="bg-green-100 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                <Users className="text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mt-2 text-green-900">187</h2>
              <p className="text-xs text-green-600 mt-1">+15% from last month</p>
            </div>

            <div className="bg-purple-100 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <DollarSign className="text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold mt-2 text-purple-900">₹8,750</h2>
              <p className="text-xs text-green-600 mt-1">+8% from last month</p>
            </div>

            <div className="bg-orange-100 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <Clock className="text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold mt-2 text-orange-900">8</h2>
              <p className="text-xs text-gray-600 mt-1">Events scheduled</p>
            </div>
          </div>

          {/* Distribution & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Event Types Distribution</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>🎬 Movie — <span className="text-gray-500">1 (33%)</span></li>
                <li>🧠 Workshop — <span className="text-gray-500">1 (33%)</span></li>
                <li>🎥 Screening — <span className="text-gray-500">1 (33%)</span></li>
                <li>🎭 Cultural — <span className="text-gray-500">0 (0%)</span></li>
                <li>📘 Academic — <span className="text-gray-500">0 (0%)</span></li>
                <li>💼 Seminar — <span className="text-gray-500">0 (0%)</span></li>
                <li>🏆 Competition — <span className="text-gray-500">0 (0%)</span></li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <ul className="space-y-3 text-sm">
                <li className="bg-blue-50 p-3 rounded-md">🔵 New event created: RRR Movie Screening <span className="text-gray-500">· 2 hours ago</span></li>
                <li className="bg-green-50 p-3 rounded-md">🟢 85 new registrations received <span className="text-gray-500">· 5 hours ago</span></li>
                <li className="bg-purple-50 p-3 rounded-md">🟣 AI/ML Workshop reached 80% capacity <span className="text-gray-500">· 1 day ago</span></li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
