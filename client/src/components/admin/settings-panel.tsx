import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";

const settingsSchema = z.object({
  studentPrefix: z.string().min(1, "Prefix is required").max(10, "Prefix too long"),
  studentMiddlePart: z.string().min(1, "Middle part is required"),
  studentNumberPadding: z.string().min(1, "Number padding is required"),
  studentSeparator: z.string().max(3, "Separator too long"),
  certPart1: z.string().min(1),
  certPart2: z.string().min(1),
  certPart3: z.string().min(1),
  certPart4: z.string().min(1),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewId, setPreviewId] = useState("");

  const { data: settings = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/settings"],
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      studentPrefix: "STU",
      studentMiddlePart: "{YEAR}",
      studentNumberPadding: "###",
      studentSeparator: "-",
      certPart1: "CERT",
      certPart2: "{YEAR}",
      certPart3: "ABCD",
      certPart4: "{###}",
    },
  });

  // Load current settings
  useEffect(() => {
    if (settings.length > 0) {
      const pattern = settings.find(s => s.key === "student_id_pattern")?.value || "STU-{YEAR}-###";
      const parts = pattern.split("-");
      if (parts.length >= 3) {
        form.setValue("studentPrefix", parts[0]);
        form.setValue("studentMiddlePart", parts[1]);
        form.setValue("studentNumberPadding", parts[2]);
        form.setValue("studentSeparator", "-");
      }

      const certPattern = settings.find(s => s.key === "certificate_id_pattern")?.value || "CERT-{YEAR}-ABCD-{###}";
      const cparts = certPattern.split("-");
      if (cparts.length === 4) {
        form.setValue("certPart1", cparts[0]);
        form.setValue("certPart2", cparts[1]);
        form.setValue("certPart3", cparts[2]);
        form.setValue("certPart4", cparts[3]);
      }
    }
  }, [settings, form]);

  // Update preview when form values change
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values.studentPrefix && values.studentMiddlePart && values.studentNumberPadding && values.studentSeparator) {
        const currentYear = new Date().getFullYear();
        const preview = `${values.studentPrefix}${values.studentSeparator}${values.studentMiddlePart.replace("{YEAR}", currentYear.toString())}${values.studentSeparator}${values.studentNumberPadding.replace(/#+/g, (match) => "1".padStart(match.length, "0"))}`;
        setPreviewId(preview);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const studentPattern = `${data.studentPrefix}${data.studentSeparator}${data.studentMiddlePart}${data.studentSeparator}${data.studentNumberPadding}`;
      const certPattern = `${data.certPart1}-${data.certPart2}-${data.certPart3}-${data.certPart4}`;

      // Save both patterns
      await apiRequest("POST", "/api/admin/settings", { key: "student_id_pattern", value: studentPattern });
      const response = await apiRequest("POST", "/api/admin/settings", { key: "certificate_id_pattern", value: certPattern });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const { data: sampleId } = useQuery({
    queryKey: ["/api/admin/generate-student-id"],
    enabled: false,
  });

  const generateSampleMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/admin/generate-student-id");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sample Generated",
        description: `Next student ID would be: ${data.studentId}`,
      });
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateSettingsMutation.mutate(data);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <p className="text-gray-600">Configure system-wide settings and preferences</p>
      </div>

      {/* Student ID Pattern Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Student ID Pattern Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="studentPrefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Part 1: Prefix</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., STU, STUDENT, S" 
                          {...field} 
                          data-testid="input-id-prefix"
                        />
                      </FormControl>
                      <FormDescription>
                        The beginning part of the student ID
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studentMiddlePart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Part 2: Middle Section</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., {YEAR}, {MONTH}, DEPT" 
                          {...field} 
                          data-testid="input-id-middle"
                        />
                      </FormControl>
                      <FormDescription>
                        Use {"{YEAR}"} for current year, {"{MONTH}"} for month, or static text
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studentNumberPadding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Part 3: Number Format</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., ###, ####, ##" 
                          {...field} 
                          data-testid="input-id-number"
                        />
                      </FormControl>
                      <FormDescription>
                        Use # symbols for digits (### = 001, #### = 0001)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studentSeparator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Separator</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., -, _, ." 
                          {...field} 
                          data-testid="input-id-separator"
                        />
                      </FormControl>
                      <FormDescription>
                        Character(s) between each part
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <h3 className="text-lg font-semibold">Certificate ID Pattern</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="certPart1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part 1</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="certPart2" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part 2</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="certPart3" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part 3</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="certPart4" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part 4</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Preview</h4>
                <div className="text-lg font-mono text-skilld-blue" data-testid="preview-student-id">
                  {previewId || "STU-2025-001"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This is how new student IDs will look
                </p>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => generateSampleMutation.mutate()}
                  disabled={generateSampleMutation.isPending}
                  data-testid="button-generate-sample"
                >
                  {generateSampleMutation.isPending ? "Generating..." : "Generate Next ID"}
                </Button>

                <div className="flex space-x-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => form.reset()}
                    data-testid="button-reset-settings"
                  >
                    Reset
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="bg-skilld-blue hover:bg-blue-700"
                    data-testid="button-save-settings"
                  >
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Additional Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Other Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Additional system settings will be added here in future updates.</p>
        </CardContent>
      </Card>
    </div>
  );
}