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
  prefix: z.string().min(1, "Prefix is required").max(10, "Prefix too long"),
  middlePart: z.string().min(1, "Middle part is required"),
  numberPadding: z.string().min(1, "Number padding is required"),
  separator: z.string().max(3, "Separator too long"),
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
      prefix: "STU",
      middlePart: "{YEAR}",
      numberPadding: "###",
      separator: "-",
    },
  });

  // Load current settings
  useEffect(() => {
    if (settings.length > 0) {
      const pattern = settings.find(s => s.key === "student_id_pattern")?.value || "STU-{YEAR}-###";
      const parts = pattern.split("-");
      if (parts.length >= 3) {
        form.setValue("prefix", parts[0]);
        form.setValue("middlePart", parts[1]);
        form.setValue("numberPadding", parts[2]);
        form.setValue("separator", "-");
      }
    }
  }, [settings, form]);

  // Update preview when form values change
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values.prefix && values.middlePart && values.numberPadding && values.separator) {
        const currentYear = new Date().getFullYear();
        const preview = `${values.prefix}${values.separator}${values.middlePart.replace("{YEAR}", currentYear.toString())}${values.separator}${values.numberPadding.replace(/#+/g, (match) => "1".padStart(match.length, "0"))}`;
        setPreviewId(preview);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const pattern = `${data.prefix}${data.separator}${data.middlePart}${data.separator}${data.numberPadding}`;
      const response = await apiRequest("POST", "/api/admin/settings", {
        key: "student_id_pattern",
        value: pattern,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Success",
        description: "Student ID pattern updated successfully",
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
                  name="prefix"
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
                  name="middlePart"
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
                  name="numberPadding"
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
                  name="separator"
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