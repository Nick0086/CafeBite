# 06 - Forms

> Best practices from React Hook Form, Zod, and modern form architecture.

---

## Sources

- [React Hook Form - Get Started](https://react-hook-form.com/get-started)
- [React Hook Form - useForm](https://react-hook-form.com/docs/useform)
- [React Hook Form - Controller](https://react-hook-form.com/docs/usecontroller/controller)
- [React Hook Form - Schema Validation](https://react-hook-form.com/docs/useform#validationSchema)
- [Zod - Documentation](https://zod.dev/)
- [Shadcn/ui - Form](https://ui.shadcn.com/docs/components/form)
- [Hookform Devtools](https://react-hook-form.devtools.com/)

---

## Why React Hook Form?

[Source: React Hook Form - Design and Philosophy](https://react-hook-form.com/get-started#Designandphilosophy)

> "Isolating component re-rendering when required"

- **No re-renders on every keystroke** (uses uncontrolled inputs)
- **Isolated re-renders** - only the field with error re-renders
- **Built-in validation** - HTML standard + schema-based
- **Small bundle size** - ~9KB minified
- **TypeScript-friendly** - type inference from schema

---

## Two Approaches: register vs Controller

[Source: React Hook Form - Integrating Controlled Inputs](https://react-hook-form.com/get-started#IntegratingControlledInputs)

### register (Uncontrolled - Best for Native Inputs)

```jsx
import { useForm } from "react-hook-form";

function SimpleForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = (data) => console.log(data);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name", { required: "Name is required" })} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register("email", { 
        required: "Email is required",
        pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
      })} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Benefits**: No re-render on input, best performance.

### Controller (Controlled - For Shadcn/Selects)

[Source: React Hook Form - Controller](https://react-hook-form.com/docs/usecontroller/controller)

```jsx
import { useForm, Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function FormWithSelect() {
  const { control, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Category 1</SelectItem>
              <SelectItem value="2">Category 2</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </form>
  );
}
```

**When to use Controller:**
- Shadcn `Select`, `Combobox`, `Switch`
- React-Select
- Date pickers
- Any non-native input

---

## Schema Validation with Zod

[Source: Zod - Basic Usage](https://zod.dev/?id=basic-usage)

**Why Zod over Yup?**
- TypeScript-first (best type inference)
- Smaller bundle size
- Modern API
- Better composability

### Schema File Pattern

```
src/components/<Module>/validation/<module>.schema.js
```

```javascript
import { z } from "zod";

export const categorySchema = z.object({
  name: z.string()
    .min(1, "Category name is required")
    .max(255, "Max 255 characters")
    .trim(),
  status: z.number().int().min(0).max(1).optional(),
});

export const categoryFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["0", "1", "all"]).optional(),
});
```

### Use in Form

```jsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { categorySchema } from "./validation/category.schema";

function CategoryForm() {
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", status: 1 },
  });
  
  // ...
}
```

---

## Complete Form Pattern (Project + Best Practice)

**Reference: `frontend/src/components/Menu/Categories/CategoriesForm.jsx`**

```jsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createCategory, updateCategory } from "@/service/categories.service";
import { toastSuccess, toastError } from "@/utils/toast-utils";
import { categorySchema } from "./validation/category.schema";
import { CATEGORIES_QUERY_KEY } from "@/hooks/useCategories";

const defaultValues = {
  name: "",
  status: 1,
};

export function CategoryForm({ open, onHide, isEdit, selectedRow }) {
  const queryClient = useQueryClient();
  
  // 1. Setup form with schema validation
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });
  
  // 2. Reset form when modal opens/closes or data changes
  useEffect(() => {
    if (isEdit && selectedRow) {
      form.reset({
        name: selectedRow.name,
        status: selectedRow.status,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [isEdit, selectedRow, form, open]);
  
  // 3. Mutations
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      toastSuccess(res?.message || "Category created");
      handleClose();
    },
    onError: (error) => {
      toastError(error?.err?.message || "Failed to create category");
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      toastSuccess(res?.message || "Category updated");
      handleClose();
    },
    onError: (error) => {
      toastError(error?.err?.message || "Failed to update category");
    },
  });
  
  // 4. Submit handler
  const onSubmit = (data) => {
    if (isEdit) {
      updateMutation.mutate({ categoryId: selectedRow.unique_id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  // 5. Close handler
  const handleClose = () => {
    form.reset(defaultValues);
    onHide();
  };
  
  const isPending = createMutation.isPending || updateMutation.isPending;
  
  // 6. JSX
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "Create Category"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter category name" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isEdit && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={String(field.value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Active</SelectItem>
                        <SelectItem value="0">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="flex items-center gap-4">
              <Button type="submit" variant="gradient" disabled={isPending}>
                {isPending ? "Saving..." : "Submit"}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Form State Management

### Modal State in Parent

**Reference: `frontend/src/components/Menu/Categories/CategoriesIndex.jsx:26`**

```jsx
// ✅ Parent owns modal state
const [selectedCategory, setSelectedCategory] = useState({
  data: null,
  isEdit: false,
  isOpen: false,
});

const openCreate = () => setSelectedCategory({ data: null, isEdit: false, isOpen: true });
const openEdit = (category) => setSelectedCategory({ data: category, isEdit: true, isOpen: true });
const closeModal = () => setSelectedCategory({ data: null, isEdit: false, isOpen: false });
```

### Form State in Form Component

```jsx
// ✅ Form owns its own state via useForm
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues,
});
```

**Rule**: Modal open/close is parent state. Form values are form state.

---

## Single Modal State Object Pattern

[Source: Industry best practice for modal management]

```jsx
// ❌ WRONG: Multiple useState
const [isOpen, setIsOpen] = useState(false);
const [mode, setMode] = useState(null);
const [data, setData] = useState(null);

const openEdit = (row) => {
  setIsOpen(true);
  setMode('edit');
  setData(row);
};

// ✅ CORRECT: Single state object
const [modalState, setModalState] = useState({
  open: false,
  mode: null,  // 'create' | 'edit' | 'view'
  data: null,
});

const openEdit = (row) => setModalState({ open: true, mode: 'edit', data: row });
const openCreate = () => setModalState({ open: true, mode: 'create', data: null });
const closeModal = () => setModalState({ open: false, mode: null, data: null });
```

---

## Single Form for Create and Edit

[Source: Industry best practice]

```jsx
function CategoryForm({ mode, data, open, onClose }) {
  // Reset form when data changes
  useEffect(() => {
    if (data && mode === 'edit') {
      form.reset({
        name: data.name,
        status: data.status,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [data, mode]);
  
  const isEdit = mode === 'edit';
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTitle>{isEdit ? 'Edit' : 'Create'}</DialogTitle>
      {/* Same form fields, same JSX */}
    </Dialog>
  );
}
```

**Benefits:**
- One component, one schema, one test
- No duplication
- Consistent UX

---

## Reusable Form Field Component

**Reference: `frontend/src/common/Form/ReusableFormField.jsx`**

The project has a `ReusableFormField` that wraps Shadcn `FormField` + `FormItem` + `FormLabel` + `FormControl` + `FormMessage`. It supports many input types:

```jsx
import ReusableFormField from "@/common/Form/ReusableFormField";

<ReusableFormField
  control={form.control}
  name="name"
  type="text"
  label="Category Name"
  required={true}
  placeholder="Enter name"
/>

<ReusableFormField
  control={form.control}
  name="status"
  type="select"
  label="Status"
  options={STATUS_OPTIONS}
/>

<ReusableFormField
  control={form.control}
  name="description"
  type="textarea"
  label="Description"
/>

<ReusableFormField
  control={form.control}
  name="password"
  type="password"
  label="Password"
/>

<ReusableFormField
  control={form.control}
  name="tags"
  type="tagInput"
  label="Tags"
/>

<ReusableFormField
  control={form.control}
  name="otp"
  type="OTP"
  label="OTP"
/>

<ReusableFormField
  control={form.control}
  name="phone"
  type="PhoneInput"
  label="Phone"
/>

<ReusableFormField
  control={form.control}
  name="attachment"
  type="file"
  label="Attachment"
/>
```

**Supported types:**
- `text` (default)
- `select`
- `combobox`
- `singleSelect` / `multiSelect` (react-select)
- `tagInput`
- `PhoneInput`
- `textarea`
- `checkbox`
- `switch`
- `password`
- `OTP`
- `radio`
- `file`
- `email`

---

## Form Validation Patterns

### Required Field

```jsx
<input {...register("name", { required: "Name is required" })} />
```

### Min/Max Length

```jsx
<input {...register("name", { 
  required: "Required",
  minLength: { value: 2, message: "Min 2 characters" },
  maxLength: { value: 255, message: "Max 255 characters" }
})} />
```

### Pattern Matching

```jsx
<input {...register("email", {
  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
})} />
```

### Custom Validation

```jsx
<input {...register("confirmPassword", {
  validate: (value) => value === password || "Passwords don't match"
})} />
```

### Schema-Based (Zod)

```javascript
// Schema
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Form
const form = useForm({
  resolver: zodResolver(schema),
});
```

---

## File Upload Pattern

**Reference: `frontend/src/components/Menu/MenuItems/MenuItemForm.jsx`**

```jsx
function MenuItemForm() {
  const form = useForm({ ... });
  
  const handleImageUpload = (image) => {
    form.setValue('cover_image', image);
  };
  
  const handleDeleteImage = () => {
    form.setValue('cover_image', null);
  };
  
  const onSubmit = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    createMutation.mutate(formData);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <ImageAvatar
        onImageUpload={handleImageUpload}
        onDeleteImage={handleDeleteImage}
      />
      {/* other fields */}
    </form>
  );
}
```

**Service for FormData:**
```javascript
export const createMenuItem = async (data) => {
  try {
    const response = await api.post("/menu", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
```

---

## Form Submission Flow

```
User clicks Submit
       ↓
form.handleSubmit(onSubmit) - runs validation
       ↓
If valid → onSubmit(data)
       ↓
useMutation.mutate(data)
       ↓
Service function (api.post/put)
       ↓
onSuccess → invalidate query + toast + close modal
       ↓
onError → toast error message
```

---

## Loading States During Submit

```jsx
function CategoryForm() {
  const mutation = useMutation({ ... });
  
  return (
    <Button 
      type="submit" 
      disabled={mutation.isPending}
    >
      {mutation.isPending ? (
        <>
          <Spinner className="mr-2" />
          Saving...
        </>
      ) : (
        'Submit'
      )}
    </Button>
  );
}
```

---

## Best Practice Checklist

- [ ] Use `react-hook-form` for all forms
- [ ] Use Zod schemas in separate `validation/` file
- [ ] `useForm` with `zodResolver` for validation
- [ ] `defaultValues` for all fields
- [ ] One state object for modal: `{ open, mode, data }`
- [ ] Single form component for create and edit
- [ ] `form.reset()` when modal opens/closes or data changes
- [ ] Disable submit button during mutation
- [ ] Show loading state on button
- [ ] `useMutation` for submit, `invalidateQueries` on success
- [ ] Toast success (with API message) and error
- [ ] `useEffect` to populate form from props when editing
- [ ] Use `Controller` for Shadcn Select, Combobox, Switch
- [ ] Use `register` for native Input, Textarea
- [ ] No `controlled` inputs in performance-critical paths
- [ ] Accessible labels on all fields
- [ ] Required fields marked with `*`
- [ ] Form error messages clear and specific
- [ ] Reset form on close
