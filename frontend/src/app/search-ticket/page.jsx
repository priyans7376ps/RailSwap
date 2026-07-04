'use client';

import { useState } from 'react';
import { Search, Filter, BellRing } from 'lucide-react';
import Navbar from '../../components/Navbar';
import TicketCard from '../../components/TicketCard';
import { searchTickets, createRequest } from '../../services/api';

export default function SearchTicketPage() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [classType, setClassType] = useState('');
  const [gender, setGender] = useState('');
  
  // Advanced filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [trainNumber, setTrainNumber] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('journey_date'); // journey_date, price_asc, price_desc, latest

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setRequestSuccess('');
    setLoading(true);

    try {
      const params = {};
      if (source.trim()) params.source = source.trim();
      if (destination.trim()) params.destination = destination.trim();
      if (date) params.date = date;
      if (classType.trim()) params.class = classType.trim();
      if (gender.trim()) params.gender = gender.trim();
      if (trainNumber.trim()) params.train_number = trainNumber.trim();
      if (priceMin) params.price_min = priceMin;
      if (priceMax) params.price_max = priceMax;
      if (sortBy) params.sort_by = sortBy;

      const res = await searchTickets(params);
      const tickets = res?.data?.tickets || res?.tickets || [];
      setResults(tickets);
    } catch (err) {
      setError(err?.message || 'Search failed. Please login and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    try {
      await createRequest({
        source_station: source,
        destination_station: destination,
        journey_date: date,
        class_type: classType,
        passenger_gender: gender
      });
      setRequestSuccess('Request created! We will notify you when a matching ticket is uploaded.');
    } catch (err) {
      setError(err?.message || 'Failed to create request');
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <p className="eyebrow">Buyer search</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950">Find a matching train ticket</h1>

        <form className="mt-8 premium-card p-5" onSubmit={handleSearch}>
          <div className="grid gap-4 md:grid-cols-5">
            <label className="space-y-2">
              <span className="label">From</span>
              <input required className="field" placeholder="Source station" value={source} onChange={(e) => setSource(e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="label">To</span>
              <input required className="field" placeholder="Destination station" value={destination} onChange={(e) => setDestination(e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="label">Date</span>
              <input required className="field" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="label">Class</span>
              <select className="field" value={classType} onChange={(e) => setClassType(e.target.value)}>
                <option value="">Any</option>
                <option value="SL">SL</option>
                <option value="3A">3A</option>
                <option value="2A">2A</option>
                <option value="1A">1A</option>
                <option value="CC">CC</option>
                <option value="EC">EC</option>
                <option value="2S">2S</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="label">Gender</span>
              <select className="field" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>

          {showAdvanced && (
            <div className="grid gap-4 md:grid-cols-4 mt-4 pt-4 border-t border-slate-100">
              <label className="space-y-2">
                <span className="label">Train Number</span>
                <input className="field" placeholder="e.g. 12001" value={trainNumber} onChange={(e) => setTrainNumber(e.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="label">Min Price</span>
                <input className="field" type="number" placeholder="0" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="label">Max Price</span>
                <input className="field" type="number" placeholder="5000" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="label">Sort By</span>
                <select className="field" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="journey_date">Journey Time</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="latest">Latest Uploads</option>
                </select>
              </label>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              <Search className="h-4 w-4" />
              {loading ? 'Searching...' : 'Find verified matches'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Filter className="h-4 w-4" />
              {showAdvanced ? 'Hide Advanced' : 'Advanced Filters'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}
        {requestSuccess && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            {requestSuccess}
          </div>
        )}

        {results !== null && (
          <section className="mt-8">
            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-center flex flex-col items-center">
                <p className="font-semibold text-slate-900">No matching tickets found</p>
                <p className="mt-2 text-sm text-slate-500 mb-4">Try adjusting your search filters or create a request to be notified.</p>
                {source && destination && date && (
                  <button onClick={handleCreateRequest} className="btn-secondary flex items-center gap-2">
                    <BellRing className="h-4 w-4" /> Notify me when matched
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-3">
                {results.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}
