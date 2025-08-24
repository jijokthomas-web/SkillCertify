import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const certificateSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  courseId: z.string().min(1, "Course is required"),
  grade: z.string().min(1, "Grade is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  notes: z.string().optional(),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

export default function CertificateForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/students"],
  });

  const { data: courses = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/courses"],
  });

  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      studentId: "",
      courseId: "",
      grade: "",
      issueDate: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const createCertificateMutation = useMutation({
    mutationFn: async (data: CertificateFormData) => {
      const certificateData = {
        studentId: data.studentId,
        courseId: data.courseId,
        grade: data.grade,
        issueDate: new Date(data.issueDate).toISOString(),
        notes: data.notes || "",
      };
      const response = await apiRequest("POST", "/api/admin/certificates", certificateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/certificates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Certificate issued successfully",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to issue certificate",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CertificateFormData) => {
    createCertificateMutation.mutate(data);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Issue New Certificate</DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Student</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-student">
                        <SelectValue placeholder="Choose a student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student: any) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.studentId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Course</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-course">
                        <SelectValue placeholder="Choose a course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., A+, 95%" 
                      {...field} 
                      data-testid="input-certificate-grade"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      data-testid="input-certificate-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any additional information about the certificate"
                    rows={3}
                    {...field}
                    data-testid="textarea-certificate-notes"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => form.reset()}
              data-testid="button-cancel-certificate"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createCertificateMutation.isPending}
              className="bg-skilld-blue hover:bg-blue-700"
              data-testid="button-submit-certificate"
            >
              {createCertificateMutation.isPending ? "Issuing..." : "Issue Certificate"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
