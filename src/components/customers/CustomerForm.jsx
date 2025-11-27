// src/components/customers/CustomerForm.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  name: yup.string().required("Name is required").min(2),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().nullable().matches(/^[0-9+()\- ]*$/, "Invalid phone").notRequired(),
  company: yup.string().nullable(),
  region: yup.string().required("Region is required"),
  status: yup.string().oneOf(["active","inactive","lead","vip"]).required(),
  notes: yup.string().nullable(),
}).required();

export default function CustomerForm({ defaultValues, onCancel, onSubmit, submitting }) {
  const { register, handleSubmit, formState: { errors } } =
    useForm({ resolver: yupResolver(schema), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
        <input {...register("name")}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input {...register("email")} type="email"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input {...register("phone")}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
        <input {...register("company")}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
        <input {...register("region")}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.region && <p className="text-red-600 text-sm mt-1">{errors.region.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select {...register("status")}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="lead">Lead</option>
          <option value="vip">VIP</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea {...register("notes")} rows="3"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="md:col-span-2 flex justify-end space-x-4">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60">
          {submitting ? "Saving..." : "Add Customer"}
        </button>
      </div>
    </form>
  );
}
