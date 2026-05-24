import React, { useState } from 'react';
import { PropertyListing } from '../types';
import { useData } from '../context/DataContext';
import { 
  X, MapPin, Bed, Bath, Square, Home, Calendar, Thermometer, Wind, 
  Car, Shield, DollarSign, ChevronDown, ChevronUp, CheckCircle, 
  Map as MapIcon, User, Phone, Mail, Share, Heart, Camera, HelpCircle
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: PropertyListing;
  onClose: () => void;
  onContact: () => void;
}

const TableRow = ({ label, value }: { label: string, value: string | number | undefined }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex justify-between py-4 border-b border-slate-100 last:border-0">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="font-bold text-slate-900 text-right">{value}</span>
    </div>
  );
};

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({ property, onClose, onContact }) => {
  const { properties } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [tourDate, setTourDate] = useState('ASAP');

  const images = property.images?.length ? property.images : [property.image];

  const similarHomes = properties
    .filter(p => p.id !== property.id && p.status === 'Active' && p.type === property.type)
    .slice(0, 3);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-[1200px] shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh]">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2.5 bg-white text-slate-900 rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Top Bar Property Address / Price (like Movoto) - only visible when scrolled down usually, but we'll integrate it into hero for now */}
          
          <div className="relative h-[450px] w-full bg-slate-900 group">
            <img 
              src={images[currentImageIndex]} 
              alt={property.address} 
              className="w-full h-full object-cover transition-opacity duration-500" 
            />
            
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all">
                  <ChevronDown className="h-6 w-6 rotate-90" />
                </button>
                <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all">
                  <ChevronDown className="h-6 w-6 -rotate-90" />
                </button>
                <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg text-white text-sm font-bold flex items-center gap-2">
                  <Camera className="h-4 w-4" /> {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}

            <div className="absolute top-6 left-6 flex gap-3">
              <span className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest ${property.status === 'Active' ? 'bg-green-600 text-white' : 'bg-slate-800/80 text-white backdrop-blur-md'}`}>
                {property.status}
              </span>
              <button className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest bg-white/90 text-slate-900 shadow-sm hover:bg-white flex items-center gap-2">
                <Share className="h-4 w-4" /> Share
              </button>
              <button className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest bg-white/90 text-slate-900 shadow-sm hover:bg-white flex items-center gap-2">
                <Heart className="h-4 w-4" /> Save
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* LEFT COLUMN: Property Details */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Header Details */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 leading-tight">{property.address}</h1>
                    <p className="text-lg text-slate-500 font-medium mt-1">
                      {property.city}, {property.state} {property.zip}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-4xl font-black text-slate-900">${property.price.toLocaleString()}</p>
                    {property.sqft && <p className="text-sm text-slate-500 font-medium">Est. payment: ${Math.round(property.price * 0.005)}/mo</p>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 py-6 border-y border-slate-200 my-6">
                  {property.bedrooms !== undefined && <div className="flex flex-col"><span className="text-2xl font-black">{property.bedrooms}</span><span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Beds</span></div>}
                  <div className="w-px h-8 bg-slate-200"></div>
                  {property.bathrooms !== undefined && <div className="flex flex-col"><span className="text-2xl font-black">{property.bathrooms}</span><span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Baths</span></div>}
                  <div className="w-px h-8 bg-slate-200"></div>
                  {property.sqft !== undefined && <div className="flex flex-col"><span className="text-2xl font-black">{property.sqft.toLocaleString()}</span><span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Sq Ft</span></div>}
                  {property.lotSize && (
                    <>
                      <div className="w-px h-8 bg-slate-200"></div>
                      <div className="flex flex-col"><span className="text-2xl font-black">{property.lotSize}</span><span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Lot</span></div>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <section>
                <h3 className="text-xl font-black text-slate-900 mb-4">Property description</h3>
                <div className="text-xs text-slate-500 font-bold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Source: {property.source || 'MLS'} 
                  <span className="mx-2">•</span> 
                  Updated: {new Date().toLocaleDateString()}
                </div>
                {property.headline && <p className="font-bold text-slate-800 mb-3">{property.headline}</p>}
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                  {property.description || "No description provided for this listing."}
                </div>
              </section>

              {/* Property Details Tables */}
              <section className="space-y-12">
                <h3 className="text-2xl font-black text-slate-900 pb-4 border-b border-slate-200">Property Details</h3>

                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Home className="h-5 w-5 text-blue-600" /> Overview</h4>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <TableRow label="Property Type" value={property.type} />
                    <TableRow label="Year Built" value={property.yearBuilt} />
                    <TableRow label="Lot Size" value={property.lotSize} />
                    <TableRow label="Heating" value={property.heating} />
                    <TableRow label="Cooling" value={property.cooling} />
                    <TableRow label="HOA" value={property.hoa ? `$${property.hoaFee}/mo` : 'None'} />
                    <TableRow label="Price per Sqft" value={property.sqft ? `$${Math.round(property.price / property.sqft)}` : undefined} />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Square className="h-5 w-5 text-blue-600" /> Interior</h4>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <TableRow label="Bedrooms" value={property.bedrooms} />
                    <TableRow label="Bathrooms" value={property.bathrooms} />
                    <TableRow label="Flooring" value={property.flooring} />
                    <TableRow label="Basement" value={property.basement} />
                    <TableRow label="Appliances" value={property.appliances} />
                    <TableRow label="Laundry" value={property.laundry} />
                    <TableRow label="Other Features" value={property.interiorFeatures} />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Wind className="h-5 w-5 text-blue-600" /> Exterior & Utilities</h4>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <TableRow label="Water" value={property.water} />
                    <TableRow label="Sewer" value={property.sewer} />
                    <TableRow label="Electric" value={property.electric} />
                    <TableRow label="Patio/Porch" value={property.patioPorch} />
                    <TableRow label="Pool/Spa" value={property.poolSpa} />
                    <TableRow label="Other Features" value={property.exteriorFeatures} />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><MapIcon className="h-5 w-5 text-blue-600" /> Location & Lot</h4>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <TableRow label="Lot Dimensions" value={property.lotDimensions} />
                    <TableRow label="Subdivision" value={property.subdivision} />
                    <TableRow label="School District" value={property.schoolDistrict} />
                    <TableRow label="Zoning" value={property.zoning} />
                  </div>
                </div>

              </section>

              {/* Price & Tax History */}
              <section>
                <h3 className="text-2xl font-black text-slate-900 mb-6 pb-4 border-b border-slate-200">Price & Tax History</h3>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest bg-slate-50 w-1/2">List Price</th>
                        <td className="px-6 py-4 font-black text-slate-900">${property.price.toLocaleString()}</td>
                      </tr>
                      {property.taxAssessedValue && (
                        <tr>
                          <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest bg-slate-50">Tax Assessed Value</th>
                          <td className="px-6 py-4 font-black text-slate-900">${property.taxAssessedValue.toLocaleString()}</td>
                        </tr>
                      )}
                      {property.taxAmount && (
                        <tr>
                          <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest bg-slate-50">Annual Taxes</th>
                          <td className="px-6 py-4 font-black text-slate-900">${property.taxAmount.toLocaleString()}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Neighborhood */}
              {(property.walkScore !== undefined || property.neighborhoodDescription || property.nearbySchools) && (
                <section>
                  <h3 className="text-2xl font-black text-slate-900 mb-6 pb-4 border-b border-slate-200">Neighborhood</h3>
                  {property.neighborhoodDescription && (
                    <p className="text-slate-600 leading-relaxed font-medium mb-6">{property.neighborhoodDescription}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {property.walkScore !== undefined && (
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Walk Score</p>
                        <p className="text-3xl font-black text-slate-900">{property.walkScore}<span className="text-lg text-slate-400">/100</span></p>
                      </div>
                    )}
                    {property.nearbySchools && property.nearbySchools.length > 0 && (
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 sm:col-span-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Nearby Schools</p>
                        <ul className="space-y-2">
                          {property.nearbySchools.map((school, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm font-medium text-slate-700">
                              <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /> {school}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              )}

            </div>

            {/* RIGHT COLUMN: Sticky Sidebar */}
            <div className="space-y-8 relative">
              <div className="sticky top-6">
                
                {/* Tour this home Widget (Movoto style) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden mb-8">
                  <div className="p-6">
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex justify-between items-center">
                      Tour this home
                      <HelpCircle className="h-5 w-5 text-slate-400 cursor-pointer" />
                    </h3>
                    
                    <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
                      <button className="flex-1 py-2 text-sm font-bold bg-white shadow-sm rounded-md text-slate-900">In-person</button>
                      <button className="flex-1 py-2 text-sm font-bold text-slate-600 rounded-md">Video chat</button>
                    </div>

                    <p className="text-sm font-bold text-slate-700 mb-3">Select a date</p>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      <button onClick={() => setTourDate('ASAP')} className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${tourDate === 'ASAP' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>ASAP</button>
                      <button onClick={() => setTourDate('This weekend')} className={`py-3 rounded-xl border-2 text-sm font-bold transition-all flex flex-col items-center justify-center ${tourDate === 'This weekend' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <span>This</span>
                        <span>weekend</span>
                      </button>
                      <button onClick={() => setTourDate('Another time')} className={`py-3 rounded-xl border-2 text-sm font-bold transition-all flex flex-col items-center justify-center ${tourDate === 'Another time' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <span>Another</span>
                        <span>time</span>
                      </button>
                    </div>

                    <button onClick={onContact} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm transition-colors shadow-lg shadow-red-600/20 mb-3">
                      Request tour
                    </button>
                    <button onClick={onContact} className="w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl font-black text-sm transition-colors">
                      Ask a question
                    </button>

                    <p className="text-[10px] text-slate-500 text-center mt-4 leading-relaxed px-2">
                      By proceeding, you consent to receive calls and texts at the number you provided.
                    </p>
                  </div>
                  
                  {/* Listed by / Contact Agent block */}
                  <div className="bg-slate-50 p-6 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Listed By</p>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" alt="Agent" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{property.sellerName || 'New Holland Agent'}</p>
                        <p className="text-xs font-medium text-slate-500">New Holland Financial Group</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Footer Metadata */}
          <div className="bg-slate-100 px-6 py-10 sm:px-10 border-t border-slate-200">
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs font-bold text-slate-500">
              {property.mlsId && <p>MLS ID: <span className="text-slate-800">{property.mlsId}</span></p>}
              {property.parcelNumber && <p>Parcel #: <span className="text-slate-800">{property.parcelNumber}</span></p>}
              {property.daysOnMarket !== undefined && <p>Days on Market: <span className="text-slate-800">{property.daysOnMarket}</span></p>}
              <p>Listed: <span className="text-slate-800">{property.listedDate}</span></p>
            </div>
            <p className="mt-6 text-[10px] text-slate-400 leading-relaxed max-w-4xl">
              The data relating to real estate for sale on this website comes in part from the Broker Reciprocity program. Real estate listings held by brokerage firms other than New Holland Financial Group are marked with the Broker Reciprocity logo and detailed information about them includes the name of the listing brokers. Information deemed reliable but not guaranteed.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
