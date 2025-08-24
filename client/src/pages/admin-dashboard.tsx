import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Tag, 
  BarChart3, 
  GraduationCap, 
  Users, 
  Search,
  LogOut,
  Plus,
  Edit,
  Trash,
  Download,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { getCurrentUser, logout } from "@/lib/auth";
import CourseForm from "@/components/admin/course-form";
import StudentForm from "@/components/admin/student-form";
import CertificateForm from "@/components/admin/certificate-form";

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalCertificates: number;
  totalVerifications: number;
}

export default function AdminDashboard({ params }: { params?: { section?: string } }) {
  const [, setLocation] = useLocation();
  const [activePanel, setActivePanel] = useState(params?.section || "overview");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setLocation("/admin/login");
      return;
    }
    setUser(currentUser);
  }, [setLocation]);

  useEffect(() => {
    if (params?.section) {
      setActivePanel(params.section);
    }
  }, [params?.section]);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/admin/courses"],
  });

  const { data: students = [] } = useQuery({
    queryKey: ["/api/admin/students"],
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ["/api/admin/certificates"],
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleNavigation = (panel: string) => {
    setActivePanel(panel);
    setLocation(`/admin/${panel}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-skilld-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-skilld-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-skilld-gray" data-testid="admin-dashboard">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-skilld-blue rounded-lg flex items-center justify-center mr-3">
                <Tag className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SKILLD Admin</h1>
                <p className="text-sm text-gray-600">Tag Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900" data-testid="text-admin-name">
                  {user?.user_metadata?.full_name || user?.email || "Admin User"}
                </p>
                <p className="text-xs text-gray-500" data-testid="text-admin-email">
                  {user?.email || "admin@skilld.com"}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-6">
            <ul className="space-y-2">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "courses", label: "Courses", icon: GraduationCap },
                { id: "students", label: "Students", icon: Users },
                { id: "certificates", label: "Certificates", icon: Tag },
              ].map((item) => (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full justify-start ${
                      activePanel === item.id 
                        ? "bg-blue-50 text-skilld-blue" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    data-testid={`nav-${item.id}`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          {/* Overview Panel */}
          {activePanel === "overview" && (
            <div data-testid="panel-overview">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-600">Manage your certificate verification system</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Courses</p>
                        <p className="text-2xl font-bold text-gray-900" data-testid="stat-courses">
                          {stats?.totalCourses || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="text-skilld-blue text-xl" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900" data-testid="stat-students">
                          {stats?.totalStudents || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="text-skilld-green text-xl" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Certificates Issued</p>
                        <p className="text-2xl font-bold text-gray-900" data-testid="stat-certificates">
                          {stats?.totalCertificates || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Tag className="text-purple-500 text-xl" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Verifications</p>
                        <p className="text-2xl font-bold text-gray-900" data-testid="stat-verifications">
                          {stats?.totalVerifications || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Search className="text-orange-500 text-xl" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Courses Panel */}
          {activePanel === "courses" && (
            <div data-testid="panel-courses">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
                  <p className="text-gray-600">Create and manage courses</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-skilld-blue hover:bg-blue-700" data-testid="button-add-course">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <CourseForm />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Course Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {courses.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
                  </div>
                ) : (
                  courses.map((course: any) => (
                    <Card key={course.id} data-testid={`card-course-${course.id}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                            <p className="text-gray-600 text-sm">{course.description}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" data-testid={`button-edit-course-${course.id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-delete-course-${course.id}`}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-500">Duration</p>
                            <p className="font-medium">{course.duration}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Created</p>
                            <p className="font-medium">{new Date(course.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {course.skills?.slice(0, 3).map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {course.skills?.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{course.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Students Panel */}
          {activePanel === "students" && (
            <div data-testid="panel-students">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
                  <p className="text-gray-600">Manage student records and enrollments</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-skilld-blue hover:bg-blue-700" data-testid="button-add-student">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <StudentForm />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Student Table */}
              <Card>
                <CardContent className="p-0">
                  {students.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No students</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by adding a new student.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Enrolled
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map((student: any) => (
                            <tr key={student.id} data-testid={`row-student-${student.id}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                    <Users className="text-gray-600 h-5 w-5" />
                                  </div>
                                  <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                    <p className="text-sm text-gray-500">{student.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {student.studentId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(student.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <Button variant="ghost" size="sm" data-testid={`button-edit-student-${student.id}`}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" data-testid={`button-delete-student-${student.id}`}>
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Certificates Panel */}
          {activePanel === "certificates" && (
            <div data-testid="panel-certificates">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Tag Management</h2>
                  <p className="text-gray-600">Issue and manage certificates</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-skilld-blue hover:bg-blue-700" data-testid="button-issue-certificate">
                      <Plus className="mr-2 h-4 w-4" />
                      Issue Tag
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <CertificateForm />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Tag Cards */}
              <div className="grid gap-6">
                {certificates.length === 0 ? (
                  <div className="text-center py-12">
                    <Tag className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by issuing a new certificate.</p>
                  </div>
                ) : (
                  certificates.map((certificate: any) => (
                    <Card key={certificate.id} data-testid={`card-certificate-${certificate.id}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-skilld-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                              <Tag className="text-skilld-blue text-2xl" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {certificate.course?.title || "Unknown Course"}
                              </h3>
                              <p className="text-gray-600">
                                Issued to {certificate.student?.name || "Unknown Student"}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Tag ID: {certificate.certificateId}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" data-testid={`button-download-certificate-${certificate.id}`}>
                              <Download className="mr-1 h-4 w-4" />
                              Download
                            </Button>
                            <Button variant="outline" size="sm" data-testid={`button-qr-certificate-${certificate.id}`}>
                              <QrCode className="mr-1 h-4 w-4" />
                              QR Code
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Issue Date</p>
                            <p className="font-medium">{new Date(certificate.issueDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Grade</p>
                            <p className="font-medium text-skilld-green">{certificate.grade}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Status</p>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                          <div>
                            <p className="text-gray-500">Verifications</p>
                            <p className="font-medium">{certificate.verificationCount}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
