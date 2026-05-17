import React, { useState } from "react";
import { CheckCircle, Home, Wrench, Droplets, Leaf, Hammer, PaintBucket, ArrowRight, X } from "lucide-react";
import { useData } from "../../context/DataContext";
import { UserRole } from "../../types";

const services = [
  {
    id: "roofing",
    title: "Roofing",
    desc: "Professional roof inspections, repairs, and full replacements using premium materials designed to withstand the elements.",
    icon: Home,
    color: "bg-blue-500",
  },
  {
    id: "drywalls",
    title: "Drywalls & Painting",
    desc: "Expert drywall installation, patching, texturing, and interior/exterior painting for a flawless finish.",
    icon: PaintBucket,
    color: "bg-indigo-500",
  },
  {
    id: "pressure-washing",
    title: "Pressure Washing",
    desc: "Restore the beauty of your siding, driveways, decks, and walkways with high-power, safe pressure washing.",
    icon: Droplets,
    color: "bg-cyan-500",
  },
  {
    id: "lawnscaping",
    title: "Lawnscaping",
    desc: "Comprehensive lawn care, landscaping design, mulching, and seasonal cleanups to elevate your curb appeal.",
    icon: Leaf,
    color: "bg-green-500",
  },
  {
    id: "renovation",
    title: "Home Renovation",
    desc: "Kitchens, bathrooms, basements, and full interior remodels. We turn your vision into a stunning reality.",
    icon: Hammer,
    color: "bg-amber-500",
  },
  {
    id: "plumbing",
    title: "Plumbing",
    desc: "Leak repairs, fixture installations, pipe replacements, and emergency plumbing services you can rely on.",
    icon: Wrench,
    color: "bg-red-500",
  },
];

export const HomeRepair: React.FC = () => {
  const { addCallback, addLead, user } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    serviceType: "",
    address: "",
    evaluationTime: "",
    propertyType: "Residential",
    issueDescription: "",
    isEmergency: false,
    timeRequested: "",
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone) {
      addCallback({
        name: formData.name,
        phone: formData.phone,
        timeRequested: formData.timeRequested || "ASAP",
      });

      const assignToId =
        user?.role === UserRole.ADVISOR || user?.role === UserRole.MANAGER
          ? user.id
          : undefined;

      addLead(
        {
          name: formData.name,
          phone: formData.phone,
          email: formData.email || "Not Provided",
          interest: formData.serviceType as any,
          message: `DSM Property Solutions requested for ${formData.serviceType}. Address: ${formData.address}. Best time: ${formData.evaluationTime || formData.timeRequested || "ASAP"}`,
          source: "company",
          customDetails: {
            homeRepairDetails: {
              address: formData.address,
              evaluationTime: formData.evaluationTime || formData.timeRequested || "ASAP",
              propertyType: formData.propertyType,
              issueDescription: formData.issueDescription,
              isEmergency: formData.isEmergency
            }
          }
        },
        assignToId,
      );

      setFormSubmitted(true);
      setTimeout(() => {
        setIsFormOpen(false);
        setFormSubmitted(false);
        setFormData({
          name: "",
          phone: "",
          email: "",
          serviceType: "",
          address: "",
          evaluationTime: "",
          propertyType: "Residential",
          issueDescription: "",
          isEmergency: false,
          timeRequested: "",
        });
      }, 3000);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24 font-sans relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-slate-200 to-transparent pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 -left-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-bold text-xs uppercase tracking-widest border border-orange-200 inline-block mb-6 shadow-sm">
            Expert Maintenance
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Premium DSM Property Solutions <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600">
              & Maintenance
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
            From minor fixes to major renovations, our trusted professionals deliver top-tier craftsmanship to keep your property in pristine condition inside and out.
          </p>
          <div className="mt-10">
            <button 
              onClick={() => setIsFormOpen(true)}
              className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/20 inline-flex items-center gap-2"
            >
              Request a Service <ArrowRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.id}
              className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className={`w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-${service.color.split('-')[1]}-500/30 transform group-hover:-translate-y-2 transition-transform duration-300`}>
                <service.icon size={28} strokeWidth={2.5} />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">
                {service.title}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                {service.desc}
              </p>

              <button 
                onClick={() => {
                  setFormData({ ...formData, serviceType: service.title });
                  setIsFormOpen(true);
                }}
                className="w-full py-4 rounded-xl bg-slate-50 text-slate-900 font-bold hover:bg-slate-100 transition-colors border border-slate-200 group-hover:border-slate-300"
              >
                Book this Service
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-3xl w-full relative overflow-hidden">
            {/* Design Ornament */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10 opacity-50"></div>
            
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 hover:text-slate-700 transition-colors z-20"
            >
              <X size={20} />
            </button>

            {formSubmitted ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">
                  Request Received!
                </h3>
                <p className="text-slate-500 text-lg font-medium">
                  Our repair team will contact you shortly to schedule your service.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-10">
                    <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                    Book a Repair
                    </h3>
                    <p className="text-slate-500 font-medium">
                    Fill out the details below and we'll get back to you immediately.
                    </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1 */}
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Full Name
                            </label>
                            <input
                            required
                            className="w-full border-2 border-slate-100 rounded-xl px-5 py-3.5 focus:border-orange-500 focus:ring-0 outline-none transition-colors bg-slate-50 font-medium"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Service Needed
                            </label>
                            <select
                            required
                            className="w-full border-2 border-slate-100 rounded-xl px-5 py-3.5 focus:border-orange-500 focus:ring-0 outline-none transition-colors bg-slate-50 font-medium appearance-none"
                            value={formData.serviceType}
                            onChange={(e) =>
                                setFormData({
                                ...formData,
                                serviceType: e.target.value,
                                })
                            }
                            >
                            <option value="">Select a service</option>
                            {services.map((s) => (
                                <option key={s.id} value={s.title}>{s.title}</option>
                            ))}
                            <option value="Other">Other / General Maintenance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Property Type
                            </label>
                            <select
                                className="w-full border-2 border-slate-100 rounded-xl px-5 py-3.5 focus:border-orange-500 focus:ring-0 outline-none transition-colors bg-slate-50 font-medium appearance-none"
                                value={formData.propertyType}
                                onChange={(e) =>
                                setFormData({ ...formData, propertyType: e.target.value })
                                }
                            >
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                            </select>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Phone Number
                            </label>
                            <input
                            required
                            type="tel"
                            className="w-full border-2 border-slate-100 rounded-xl px-5 py-3.5 focus:border-orange-500 focus:ring-0 outline-none transition-colors bg-slate-50 font-medium"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Property Address
                            </label>
                            <input
                            required
                            className="w-full border-2 border-slate-100 rounded-xl px-5 py-3.5 focus:border-orange-500 focus:ring-0 outline-none transition-colors bg-slate-50 font-medium"
                            placeholder="123 Main St, City, State"
                            value={formData.address}
                            onChange={(e) =>
                                setFormData({ ...formData, address: e.target.value })
                            }
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Evaluation Time
                            </label>
                            <select
                                required
                                className="w-full border-2 border-slate-100 rounded-xl px-5 py-3.5 focus:border-orange-500 focus:ring-0 outline-none transition-colors bg-slate-50 font-medium appearance-none"
                                value={formData.evaluationTime}
                                onChange={(e) =>
                                setFormData({ ...formData, evaluationTime: e.target.value })
                                }
                            >
                                <option value="">Select time</option>
                                <option value="ASAP">As Soon As Possible</option>
                                <option value="Morning (8AM - 12PM)">Morning</option>
                                <option value="Afternoon (12PM - 4PM)">Afternoon</option>
                                <option value="Evening (4PM - 7PM)">Evening</option>
                            </select>
                        </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Describe the Issue
                    </label>
                    <textarea
                      required
                      rows={2}
                      className="w-full border-2 border-slate-100 rounded-xl px-5 py-4 focus:border-orange-500 focus:ring-0 outline-none transition-colors bg-slate-50 font-medium resize-none"
                      placeholder="Please provide details about the damage or requested service..."
                      value={formData.issueDescription}
                      onChange={(e) =>
                        setFormData({ ...formData, issueDescription: e.target.value })
                      }
                    ></textarea>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
                    <div className="flex items-center gap-3">
                        <input
                        type="checkbox"
                        id="emergency"
                        className="w-5 h-5 rounded border-slate-300 text-red-500 focus:ring-red-500"
                        checked={formData.isEmergency}
                        onChange={(e) =>
                            setFormData({ ...formData, isEmergency: e.target.checked })
                        }
                        />
                        <label htmlFor="emergency" className="text-sm font-bold text-slate-700">
                        This is an emergency (Urgent repair needed)
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="bg-orange-600 text-white font-black px-10 py-4 rounded-xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 uppercase tracking-widest text-sm hover:scale-105 active:scale-95"
                    >
                        Confirm Booking
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
