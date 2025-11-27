// src/components/customers/CustomerRow.jsx
import React from "react";

export default function CustomerRow({ customer }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'lead': return 'bg-blue-100 text-blue-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {customer.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{customer.email}</div>
        {customer.phone && <div className="text-sm text-gray-500">{customer.phone}</div>}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.company || 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.region}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ${Number(customer.totalSpent || 0).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.totalPurchases || 0}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
          {customer.status}
        </span>
      </td>
    </tr>
  );
}
