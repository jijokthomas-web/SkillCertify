import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Tag, CheckCircle, ArrowLeft, Copy, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateQRCodeURL } from "@/lib/qr-generator";

interface VerificationData {
  certificate: {
    id: string;
    certificateId: string;
    grade: string;
    issueDate: string;
    qrCode: string;
    verificationCount: string;
    notes?: string;
  };
  student: {
    name: string;
    email: string;
    studentId: string;
  };
  course: {
    title: string;
    description: string;
    duration: string;
    skills: string[];
  };
}

export default function Verify({ params }: { params: { certificateId: string } }) {
  const { certificateId } = params;
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<VerificationData>({
    queryKey: ["/api/verify", certificateId],
    enabled: !!certificateId,
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-skilld-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-skilld-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-skilld-gray">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-skilld-blue rounded-lg flex items-center justify-center mr-4">
                  <Tag className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Verified By SKILLD</h1>
                  <p className="text-sm text-gray-600">Certificate Verification</p>
                </div>
              </div>
              <Link href="/">
                <Button variant="ghost" className="text-skilld-blue hover:bg-blue-50" data-testid="button-back-home">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Verification
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex mb-4 gap-2">
                <AlertCircle className="h-8 w-8 text-skilld-red" />
                <h1 className="text-2xl font-bold text-gray-900">Certificate Not Found</h1>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                The certificate ID "{certificateId}" could not be found in our system.
              </p>
              <div className="mt-6">
                <Link href="/">
                  <Button className="w-full bg-skilld-blue hover:bg-blue-700" data-testid="button-try-again">
                    Try Another Certificate
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const qrCodeDataURL = generateQRCodeURL(data.certificate.qrCode);
  const verificationUrl = data.certificate.qrCode;

  return (
    <div className="min-h-screen bg-skilld-gray" data-testid="verify-page">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-skilld-blue rounded-lg flex items-center justify-center mr-4">
                <Tag className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Verified By SKILLD</h1>
                <p className="text-sm text-gray-600">Certificate Details</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" className="text-skilld-blue hover:bg-blue-50" data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Verification
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Certificate Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Verification Status */}
        <div className="bg-skilld-green bg-opacity-10 border border-skilld-green rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <CheckCircle className="text-skilld-green text-2xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold text-skilld-green">Certificate Verified</h2>
              <p className="text-green-700">This certificate is authentic and valid</p>
            </div>
          </div>
        </div>

        {/* Tag Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900" data-testid="text-course-title">
              {data.course.title}
            </CardTitle>
            <p className="text-lg text-gray-600" data-testid="text-course-description">
              {data.course.description}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900" data-testid="text-student-name">{data.student.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900" data-testid="text-student-email">{data.student.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Student ID</label>
                    <p className="text-gray-900" data-testid="text-student-id">{data.student.studentId}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Certificate Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Certificate ID</label>
                    <p className="text-gray-900" data-testid="text-certificate-id">{data.certificate.certificateId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Issue Date</label>
                    <p className="text-gray-900" data-testid="text-issue-date">
                      {new Date(data.certificate.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Course Duration</label>
                    <p className="text-gray-900" data-testid="text-course-duration">{data.course.duration}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Grade</label>
                    <p className="text-skilld-green font-semibold" data-testid="text-grade">{data.certificate.grade}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Skills */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Skills Covered</h4>
              <div className="flex flex-wrap gap-2" data-testid="skills-list">
                {data.course.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification QR Code */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Share This Verification</h4>
              <div className="inline-block p-4 bg-gray-50 rounded-lg">
                <img 
                  src={qrCodeDataURL} 
                  alt="Certificate QR Code" 
                  className="w-32 h-32"
                  data-testid="img-qr-code"
                />
              </div>
              <p className="text-sm text-gray-600 mt-4">Scan to verify this certificate</p>
              <div className="mt-4 flex gap-2 max-w-md mx-auto">
                <Input
                  type="text"
                  value={verificationUrl}
                  className="bg-gray-50 text-center text-sm"
                  readOnly
                  data-testid="input-verification-url"
                />
                <Button
                  onClick={() => copyToClipboard(verificationUrl)}
                  className="bg-skilld-blue hover:bg-blue-700 text-white"
                  data-testid="button-copy-url"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
