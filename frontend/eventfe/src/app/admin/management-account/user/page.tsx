"use client";

import React, { useState } from "react";

type AccountType = "CLB" | "BEN_THU_3" | "SINH_VIEN";

interface FormErrors {
  [key: string]: string;
}

export default function CreateAccountPage() {
  const [accountType, setAccountType] = useState<AccountType>("CLB");
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    studentId: "",
    clbName: "Danh sách Câu lạc bộ",
    thirdParty: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validate = () => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) newErrors.email = "Email không được để trống";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Email không đúng định dạng";

    if (!formData.password) newErrors.password = "Mật khẩu không được để trống";
    else if (formData.password.length < 8) newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";

    if (accountType === "CLB") {
      if (formData.clbName === "Danh sách Câu lạc bộ") newErrors.clbName = "Vui lòng chọn một câu lạc bộ";
    }

    if (accountType === "BEN_THU_3") {
      if (!formData.thirdParty.trim()) newErrors.thirdParty = "Vui lòng nhập tên bên thứ 3";
    }

    if (accountType === "SINH_VIEN") {
      if (!formData.fullName.trim()) newErrors.fullName = "Họ tên không được để trống";
      if (!formData.studentId.trim()) newErrors.studentId = "Mã sinh viên không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowSuccess(true);
      console.log("Dữ liệu hợp lệ:", formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 font-sans text-slate-800 relative">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-[#005d7a] mb-8 tracking-wider">
          TẠO TÀI KHOẢN
        </h1>

        <form onSubmit={handleCreateAccount} className="space-y-8">
          <div className="flex flex-wrap items-center gap-8 justify-center mb-10">
            <span className="font-semibold">Đối tượng tạo tài khoản</span>
            {(["CLB", "BEN_THU_3", "SINH_VIEN"] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={accountType === type}
                  onChange={() => {
                    setAccountType(type);
                    setErrors({});
                  }}
                  className="w-4 h-4 accent-[#005d7a]"
                />
                <span>{type === "CLB" ? "Câu lạc bộ" : type === "BEN_THU_3" ? "Bên thứ 3" : "Sinh viên"}</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accountType === "CLB" && (
              <div className="md:col-span-2">
                <label className="block font-semibold mb-2">Chọn câu lạc bộ:</label>
                <select 
                  name="clbName"
                  value={formData.clbName}
                  onChange={handleChange}
                  className={`w-full md:w-1/2 p-2 border rounded-md bg-white outline-none focus:ring-1 ${errors.clbName ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option>Danh sách Câu lạc bộ</option>
                  <option>CLB Công nghệ thông tin</option>
                  <option>CLB Kỹ năng mềm</option>
                </select>
                {errors.clbName && <p className="text-red-500 text-sm mt-1">{errors.clbName}</p>}
              </div>
            )}

            {accountType === "BEN_THU_3" && (
              <div className="md:col-span-2">
                <label className="block font-semibold mb-2">Chọn bên thứ 3:</label>
                <input
                  type="text"
                  name="thirdParty"
                  placeholder="Nhập tên đơn vị..."
                  onChange={handleChange}
                  className={`w-full md:w-1/2 p-2 border rounded-md outline-none ${errors.thirdParty ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                />
                {errors.thirdParty && <p className="text-red-500 text-sm mt-1">{errors.thirdParty}</p>}
              </div>
            )}

            {accountType === "SINH_VIEN" && (
              <>
                <div>
                  <label className="block font-semibold mb-2">Họ tên:</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Nguyễn Văn A"
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md outline-none ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block font-semibold mb-2">Mã sinh viên:</label>
                  <input
                    type="text"
                    name="studentId"
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md outline-none ${errors.studentId ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.studentId && <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>}
                </div>
              </>
            )}

            <div className={accountType === "SINH_VIEN" ? "" : "md:col-span-1"}>
              <label className="block font-semibold mb-2">Email</label>
              <input
                type="text"
                name="email"
                placeholder="ava.wright@gmail.com"
                onChange={handleChange}
                className={`w-full p-2 border rounded-md outline-none ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className={accountType === "SINH_VIEN" ? "" : "md:col-span-1"}>
              <label className="block font-semibold mb-2">Password:</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="********"
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md outline-none pr-10 ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-200'}`}
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
          </div>

          <div className="flex justify-end pt-20">
            <button
              type="submit"
              className="bg-[#005d7a] text-white px-6 py-2 rounded-md hover:bg-[#004a61] transition-all active:scale-95"
            >
              Tạo tài khoản
            </button>
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-blue-400 p-8 rounded-sm shadow-xl max-w-sm w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-4 flex justify-center">
              <div className="bg-[#005d7a] rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
            </div>
            <h2 className="text-[#005d7a] text-xl font-bold mb-2">Tạo tài khoản thành công</h2>
            <p className="text-gray-600 mb-6">Tài khoản đã được ghi nhận vào hệ thống</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="bg-[#005d7a] text-white px-8 py-2 rounded-md hover:bg-[#004a61]"
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </div>
  );
}