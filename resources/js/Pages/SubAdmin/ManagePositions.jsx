import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { FaHome, FaRegFlag, FaUsers, FaChalkboardTeacher, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';

export default function ManagePositions({ positions, electionId, flash }) {
    const [positionName, setPositionName] = useState('');
    const [maxVotes, setMaxVotes] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(flash?.success || null);
    const [storedElectionId, setStoredElectionId] = useState(null);
    const [positionsData, setPositionsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editPositionId, setEditPositionId] = useState(null);

    useEffect(() => {
        const storedElectionId = localStorage.getItem('election_id');
        setStoredElectionId(storedElectionId);

        const fetchPositions = async () => {
            try {
                const finalElectionId = electionId || storedElectionId;
                if (finalElectionId) {
                    const response = await axios.get(`/positions/${finalElectionId}`);
                    setPositionsData(response.data); // Assuming response.data contains the positions
                }
            } catch (error) {
                console.error('Error fetching positions:', error);
                setError('An error occurred while fetching positions.');
            } finally {
                setLoading(false);
            }
        };

        fetchPositions();
    }, [electionId, storedElectionId]);

    const handleCreateOrUpdatePosition = async (e) => {
        e.preventDefault();

        if (!electionId && !storedElectionId) {
            setError('Election ID is missing');
            return;
        }

        const finalElectionId = electionId || storedElectionId;

        try {
            let response;
            if (isEditing) {
                // Update the position
                response = await axios.put(`/positions/${finalElectionId}/${editPositionId}`, {
                    name: positionName,
                    max_votes: maxVotes,
                });
                setSuccess('Position updated successfully');
                setIsEditing(false);
                setEditPositionId(null);
            } else {
                // Create a new position
                response = await axios.post(`/positions/${finalElectionId}`, {
                    name: positionName,
                    max_votes: maxVotes,
                });
                setSuccess('Position created successfully');
            }

            // Reset form fields
            setPositionName('');
            setMaxVotes('');
            setPositionsData((prev) =>
                isEditing
                    ? prev.map((pos) =>
                          pos.id === editPositionId
                              ? { ...pos, name: positionName, max_votes: maxVotes }
                              : pos
                      )
                    : [...prev, { id: response.data.id, name: positionName, max_votes: maxVotes }]
            );
        } catch (error) {
            console.error('Error creating or updating position:', error);
            setError('An error occurred while creating or updating the position');
        }
    };

    const handleEdit = (position) => {
        setIsEditing(true);
        setEditPositionId(position.id);
        setPositionName(position.name);
        setMaxVotes(position.max_votes);
    };

    const handleDelete = async (positionId) => {
        if (window.confirm('Are you sure you want to delete this position?')) {
            try {
                const finalElectionId = electionId || storedElectionId;
                await axios.delete(`/positions/${finalElectionId}/${positionId}`);
                setSuccess('Position deleted successfully');
                setPositionsData((prev) => prev.filter((pos) => pos.id !== positionId));
            } catch (error) {
                console.error('Error deleting position:', error);
                setError('An error occurred while deleting the position');
            }
        }
    };

    const handleLogout = () => {
        axios.post('/logout').then(() => {
            window.location.href = '/login';
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-700 to-teal-700">
            <Head title="Manage Positions" />

            {/* Navbar */}
            <nav className="bg-transparent text-white shadow-lg border-b-4 border-green-300 transition duration-500 ease-in-out transform hover:scale-105">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        {/* Title */}
                        <h2 className="text-3xl font-extrabold text-green-100 tracking-wide">
                            Mindoro State University Voting System
                        </h2>

                        {/* Navigation Links */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 mt-4 sm:mt-0">
                            <Link
                                href={route('subdashboard')}
                                className="text-white flex items-center gap-2 px-6 py-3 rounded-lg transition transform hover:bg-green-700 hover:scale-105 ease-in-out duration-300"
                            >
                                <FaHome className="text-xl" /> Home
                            </Link>
                            <Link
                                href={route('manage-positions')}
                                className="text-white flex items-center gap-2 px-6 py-3 rounded-lg transition transform hover:bg-green-700 hover:scale-105 ease-in-out duration-300"
                            >
                                <FaRegFlag className="text-xl" /> Manage Positions
                            </Link>
                            <Link
                                href={route('manage-voters')}
                                className="text-white flex items-center gap-2 px-6 py-3 rounded-lg transition transform hover:bg-green-700 hover:scale-105 ease-in-out duration-300"
                            >
                                <FaUsers className="text-xl" /> Manage Voters
                            </Link>
                            <Link
                                href={route('manage-candidates')}
                                className="text-white flex items-center gap-2 px-6 py-3 rounded-lg transition transform hover:bg-green-700 hover:scale-105 ease-in-out duration-300"
                            >
                                <FaChalkboardTeacher className="text-xl" /> Manage Candidates
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-white flex items-center gap-2 px-6 py-3 rounded-lg transition transform hover:bg-green-700 hover:scale-105 ease-in-out duration-300"
                            >
                                <FaSignOutAlt className="text-xl" /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-xl sm:rounded-lg border-t-4 border-green-500">
                        <div className="p-8 text-gray-900">
                            <h3 className="text-2xl font-medium text-green-600 mb-6">
                                Manage Positions
                            </h3>

                            {success && (
                                <div className="mt-4 p-4 bg-green-200 text-green-700 rounded-md">
                                    {success}
                                </div>
                            )}
                            {error && (
                                <div className="mt-4 p-4 bg-red-200 text-red-700 rounded-md">
                                    {error}
                                </div>
                            )}

                            <div className="mt-6">
                                <form onSubmit={handleCreateOrUpdatePosition}>
                                    <div className="mb-4">
                                        <label htmlFor="positionName" className="block text-sm font-medium text-gray-700">
                                            Position Name
                                        </label>
                                        <input
                                            type="text"
                                            id="positionName"
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={positionName}
                                            onChange={(e) => setPositionName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="maxVotes" className="block text-sm font-medium text-gray-700">
                                            Max Votes
                                        </label>
                                        <input
                                            type="number"
                                            id="maxVotes"
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={maxVotes}
                                            onChange={(e) => setMaxVotes(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-4">
                                        <button
                                            type="submit"
                                            className="bg-green-600 text-white py-2 px-6 rounded-lg"
                                        >
                                            {isEditing ? 'Update Position' : 'Create Position'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="mt-8">
                                <h4 className="text-xl font-semibold text-green-600">Position List</h4>
                                <ul className="mt-4">
                                    {loading ? (
                                        <li>Loading positions...</li>
                                    ) : (
                                        positionsData.map((position) => (
                                            <li key={position.id} className="flex justify-between items-center py-2 border-b">
                                                <div className="flex items-center">
                                                    <span className="font-medium">{position.name}</span>
                                                    <span className="ml-4 text-sm text-gray-500">Max Votes: {position.max_votes}</span>
                                                </div>
                                                <div className="space-x-4">
                                                    <button
                                                        onClick={() => handleEdit(position)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(position.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
