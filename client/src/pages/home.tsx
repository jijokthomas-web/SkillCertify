import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Tag, Shield, Clock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const [certificateId, setCertificateId] = useState("");
  const { toast } = useToast();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a certificate ID",
        variant: "destructive",
      });
      return;
    }
    setLocation(`/verify/${certificateId.trim()}`);
  };

  return (
    <div className="min-h-screen bg-skilld-gray" data-testid="home-page">
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
                <p className="text-sm text-gray-600">Certificate Verification System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Verify Your Certificate</h2>
          <p className="text-xl text-gray-600 mb-12">Enter your certificate ID or scan the QR code to verify authenticity</p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <form onSubmit={handleVerify} className="max-w-md mx-auto">
            <label htmlFor="certificate-id" className="block text-sm font-medium text-gray-700 mb-2">
              Certificate ID
            </label>
            <div className="flex gap-4">
              <Input
                id="certificate-id"
                type="text"
                placeholder="Enter certificate ID (e.g., SKILLD-2024-001)"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                className="flex-1"
                data-testid="input-certificate-id"
              />
              <Button 
                type="submit"
                className="bg-skilld-blue hover:bg-blue-700 text-white"
                data-testid="button-verify"
              >
                Verify
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              <Tag className="inline w-4 h-4 mr-1" />
              You can also scan the QR code on your certificate
            </p>
          </form>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-skilld-blue bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-skilld-blue text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Verification</h3>
            <p className="text-gray-600">All certificates are cryptographically secured and tamper-proof</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-skilld-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-skilld-green text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-gray-600">Get verification results immediately with detailed information</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="text-purple-500 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Friendly</h3>
            <p className="text-gray-600">Scan QR codes directly from your mobile device</p>
          </div>
        </div>
      </div>
    </div>
  );
}
