import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Download, Copy, Share2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
type QRType = "url" | "text" | "email" | "phone" | "sms" | "contact" | "wifi";

interface ContactData {
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  email: string;
  phone: string;
  mobile: string;
}

interface WiFiData {
  ssid: string;
  password: string;
  security: string;
  hidden: boolean;
}

const QRGenerator = () => {
  const [qrData, setQrData] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [activeTab, setActiveTab] = useState<QRType>("url");
  const [trackScans, setTrackScans] = useState(false);
  const [removeWatermark, setRemoveWatermark] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Form states for different QR types
  const [urlData, setUrlData] = useState("");
  const [textData, setTextData] = useState("");
  const [emailData, setEmailData] = useState({ email: "", subject: "", body: "" });
  const [phoneData, setPhoneData] = useState("");
  const [smsData, setSmsData] = useState({ phone: "", message: "" });
  const [contactData, setContactData] = useState<ContactData>({
    firstName: "",
    lastName: "",
    organization: "",
    title: "",
    email: "",
    phone: "",
    mobile: "",
  });
  const [wifiData, setWifiData] = useState<WiFiData>({
    ssid: "",
    password: "",
    security: "WPA",
    hidden: false,
  });

  // Generate QR code based on active tab and data
  useEffect(() => {
    let data = "";
    
    switch (activeTab) {
      case "url":
        data = urlData || "https://example.com";
        break;
      case "text":
        data = textData || "Sample text";
        break;
      case "email":
        data = `mailto:${emailData.email}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
        break;
      case "phone":
        data = `tel:${phoneData}`;
        break;
      case "sms":
        data = `sms:${smsData.phone}?body=${encodeURIComponent(smsData.message)}`;
        break;
      case "contact":
        data = `BEGIN:VCARD\nVERSION:3.0\nFN:${contactData.firstName} ${contactData.lastName}\nORG:${contactData.organization}\nTITLE:${contactData.title}\nEMAIL:${contactData.email}\nTEL:${contactData.phone}\nTEL;TYPE=CELL:${contactData.mobile}\nEND:VCARD`;
        break;
      case "wifi":
        data = `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password};H:${wifiData.hidden};`;
        break;
    }
    
    setQrData(data);
  }, [activeTab, urlData, textData, emailData, phoneData, smsData, contactData, wifiData]);

  // Generate QR code when data changes
  useEffect(() => {
    if (qrData) {
      QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(setQrCode);
    }
  }, [qrData]);

  const downloadQR = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = qrCode;
      link.click();
      
      toast({
        title: "QR Code Downloaded",
        description: "Your QR code has been saved successfully!",
      });
    }
  };

  const copyQR = async () => {
    if (qrCode) {
      try {
        const response = await fetch(qrCode);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        
        toast({
          title: "QR Code Copied",
          description: "QR code copied to clipboard!",
        });
      } catch (err) {
        toast({
          title: "Copy Failed",
          description: "Unable to copy QR code to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const shareQR = async () => {
    if (navigator.share && qrCode) {
      try {
        const response = await fetch(qrCode);
        const blob = await response.blob();
        const file = new File([blob], `qr-code-${activeTab}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: 'QR Code',
          files: [file]
        });
      } catch (err) {
        toast({
          title: "Share Failed",
          description: "Unable to share QR code.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">QR Code Generator</h1>
          <p className="text-muted-foreground text-lg">Create custom QR codes for any purpose</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - QR Type Selection and Forms */}
          <Card className="p-6">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as QRType)}>
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 gap-1 bg-muted p-1 mb-6">
                  <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
                  <TabsTrigger value="text" className="text-xs">Text</TabsTrigger>
                  <TabsTrigger value="email" className="text-xs">Email</TabsTrigger>
                  <TabsTrigger value="phone" className="text-xs">Phone</TabsTrigger>
                  <TabsTrigger value="sms" className="text-xs">SMS</TabsTrigger>
                  <TabsTrigger value="contact" className="text-xs">Contact</TabsTrigger>
                  <TabsTrigger value="wifi" className="text-xs">WiFi</TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-4">
                  <div>
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      placeholder="https://example.com"
                      value={urlData}
                      onChange={(e) => setUrlData(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <div>
                    <Label htmlFor="text">Plain Text</Label>
                    <Textarea
                      id="text"
                      placeholder="Enter your text here..."
                      value={textData}
                      onChange={(e) => setTextData(e.target.value)}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                  <div>
                    <Label htmlFor="email-addr">Email Address</Label>
                    <Input
                      id="email-addr"
                      placeholder="user@example.com"
                      value={emailData.email}
                      onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Email subject"
                      value={emailData.subject}
                      onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="body">Message</Label>
                    <Textarea
                      id="body"
                      placeholder="Email message..."
                      value={emailData.body}
                      onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4">
                  <div>
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <Input
                      id="phone-number"
                      placeholder="+1234567890"
                      value={phoneData}
                      onChange={(e) => setPhoneData(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="sms" className="space-y-4">
                  <div>
                    <Label htmlFor="sms-phone">Phone Number</Label>
                    <Input
                      id="sms-phone"
                      placeholder="+1234567890"
                      value={smsData.phone}
                      onChange={(e) => setSmsData({ ...smsData, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sms-message">Message</Label>
                    <Textarea
                      id="sms-message"
                      placeholder="SMS message..."
                      value={smsData.message}
                      onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Share contact details easily</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={contactData.firstName}
                        onChange={(e) => setContactData({ ...contactData, firstName: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={contactData.lastName}
                        onChange={(e) => setContactData({ ...contactData, lastName: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={contactData.organization}
                        onChange={(e) => setContactData({ ...contactData, organization: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={contactData.title}
                        onChange={(e) => setContactData({ ...contactData, title: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        value={contactData.email}
                        onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone">Phone</Label>
                      <Input
                        id="contact-phone"
                        value={contactData.phone}
                        onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="mobile">Mobile Phone</Label>
                      <Input
                        id="mobile"
                        value={contactData.mobile}
                        onChange={(e) => setContactData({ ...contactData, mobile: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="wifi" className="space-y-4">
                  <div>
                    <Label htmlFor="ssid">Network Name (SSID)</Label>
                    <Input
                      id="ssid"
                      placeholder="MyWiFiNetwork"
                      value={wifiData.ssid}
                      onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="WiFi password"
                      value={wifiData.password}
                      onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hidden-network"
                      checked={wifiData.hidden}
                      onCheckedChange={(checked) => setWifiData({ ...wifiData, hidden: checked })}
                    />
                    <Label htmlFor="hidden-network">Hidden network</Label>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Options */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="track-scans"
                      checked={trackScans}
                      onCheckedChange={setTrackScans}
                    />
                    <Label htmlFor="track-scans" className="flex items-center gap-2">
                      Track your scans ⚡
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="remove-watermark"
                      checked={removeWatermark}
                      onCheckedChange={setRemoveWatermark}
                    />
                    <Label htmlFor="remove-watermark" className="flex items-center gap-2">
                      Remove watermark ⚡
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - QR Code Display and Actions */}
          <Card className="p-6">
            <CardContent className="p-0 text-center">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-4">
                  To enable tracking, <span className="text-primary underline cursor-pointer">create a Dynamic QR Code</span>
                </p>
                
                {/* QR Code Display */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    {qrCode && (
                      <img 
                        src={qrCode} 
                        alt="Generated QR Code" 
                        className="w-64 h-64"
                      />
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <Button 
                    variant="qr" 
                    size="lg" 
                    onClick={downloadQR}
                    className="h-12"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={copyQR}
                    className="h-12"
                  >
                    <Copy className="w-5 h-5" />
                    Copy
                  </Button>
                </div>

                <div className="flex justify-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={shareQR}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default QRGenerator;