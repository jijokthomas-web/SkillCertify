import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  studentId: z.string().optional(),
  autoGenerateId: z.boolean(),
}).superRefine((data, ctx) => {
  if (!data.autoGenerateId && (!data.studentId || data.studentId.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Student ID is required when auto-generation is disabled",
      path: ["studentId"],
    });
  }
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function StudentForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      email: "",
      studentId: "",
      autoGenerateId: true,
    },
  });

  const autoGenerateId = form.watch("autoGenerateId");

  const createStudentMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const response = await apiRequest("POST", "/api/admin/students", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Student added successfully",
      });
      form.reset({
        name: "",
        email: "",
        studentId: "",
        autoGenerateId: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StudentFormData) => {
    createStudentMutation.mutate(data);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Student</DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., John Smith" 
                    {...field} 
                    data-testid="input-student-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="e.g., john.smith@email.com" 
                    {...field} 
                    data-testid="input-student-email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="autoGenerateId"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Auto-generate Student ID
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate ID using pattern (STU-YYYY-###)
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-auto-generate-id"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {!autoGenerateId && (
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., STU-2024-001" 
                      {...field} 
                      data-testid="input-student-id"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => form.reset({
                name: "",
                email: "",
                studentId: "",
                autoGenerateId: true,
              })}
              data-testid="button-cancel-student"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createStudentMutation.isPending}
              className="bg-skilld-blue hover:bg-blue-700"
              data-testid="button-submit-student"
            >
              {createStudentMutation.isPending ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}