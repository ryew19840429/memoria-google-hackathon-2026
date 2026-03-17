import { useState, useEffect } from 'react';
import { ArrowLeft, MoreVertical, MapPin, ClipboardList, Pill, AlertTriangle, Phone, MessageSquare } from 'lucide-react';
import { Modal } from './Modal';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { UserProfile } from '../../patient/companion/types';

export default function ClientProfile() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // If auth state is already initialized, fetch immediately
    if (auth.currentUser) {
      fetchProfile();
    } else {
      // Otherwise wait for auth state
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          fetchProfile();
        } else {
          setLoading(false);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-slate-50 dark:bg-background-dark h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const patientName = profile ? (profile.patientName || profile.displayName || 'Unnamed Patient') : 'Robert Sterling';
  const dob = profile?.dateOfBirth || (profile ? 'Not provided' : '1945-05-12');
  const age = profile?.dateOfBirth ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : (profile ? '--' : 79);
  const address = profile?.homeAddress || (profile ? 'Not provided' : 'Room 402, North Wing');
  const profilePic = profile?.profilePicture || (profile ? `https://ui-avatars.com/api/?name=${encodeURIComponent(patientName)}&background=random` : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');
  const conditions = profile ? (profile.conditions || []) : ['Type 2 Diabetes', 'Hypertension', 'Osteoarthritis'];
  const medications = profile ? (profile.medications || []) : ['Metformin (500mg)', 'Lisinopril (10mg)', 'Daily Multivitamin'];
  const allergies = profile ? (profile.allergies || []) : ['Penicillin', 'Peanuts (Severe)'];

  return (
    <div className="max-w-md mx-auto bg-slate-50 dark:bg-background-dark h-full flex flex-col">
      <div className="flex items-center bg-slate-50 dark:bg-slate-900 p-4 pb-2 justify-between sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
        <div className="w-12 shrink-0"></div>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">Client Profile</h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex items-center justify-center rounded-xl h-12 bg-transparent text-slate-900 dark:text-white p-0 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors w-10" onClick={() => setActiveModal('moreOptions')}>
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex p-6">
        <div className="flex w-full flex-col gap-4 items-center">
          <div className="flex gap-4 flex-col items-center">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-white dark:border-slate-800 shadow-lg" 
              style={{backgroundImage: `url("${profilePic}")`}}
            ></div>
            <div className="flex flex-col items-center justify-center">
              <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight text-center">{patientName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-500 dark:text-slate-400 text-base font-normal">{age} years old</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-slate-500 dark:text-slate-400 text-base font-normal">DOB: {new Date(dob).toLocaleDateString()}</span>
              </div>
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors" onClick={() => setActiveModal('map')}>
                <MapPin className="w-4 h-4 mr-1" />
                {address}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 p-4">
        <div className="flex min-w-[100px] flex-1 flex-col gap-1 rounded-xl p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setActiveModal('conditions')}>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Conditions</p>
          <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">{conditions.length}</p>
        </div>
        <div className="flex min-w-[100px] flex-1 flex-col gap-1 rounded-xl p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setActiveModal('medications')}>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Medications</p>
          <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">{medications.length}</p>
        </div>
        <div className="flex min-w-[100px] flex-1 flex-col gap-1 rounded-xl p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-red-300 transition-colors" onClick={() => setActiveModal('allergies')}>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Allergies</p>
          <p className="text-red-500 text-2xl font-bold leading-tight">{allergies.length}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">Medical Summary</h3>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 flex items-start gap-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" onClick={() => setActiveModal('conditions')}>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Chronic Conditions</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{conditions.join(', ')}</p>
            </div>
          </div>
          <div className="p-4 flex items-start gap-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" onClick={() => setActiveModal('medications')}>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Active Medications</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{medications.join(', ')}</p>
            </div>
          </div>
          <div className="p-4 flex items-start gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" onClick={() => setActiveModal('allergies')}>
            <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Allergies</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{allergies.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">Emergency Contacts</h3>
          <button className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline" onClick={() => setActiveModal('addContact')}>Add New</button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <span className="font-bold">S</span>
              </div>
              <div>
                <p className="font-bold text-slate-900">Sarah Sterling</p>
                <p className="text-xs text-slate-500">Daughter • +1 (555) 012-3456</p>
              </div>
            </div>
            <button className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors" onClick={() => setActiveModal('callSarah')}>
              <Phone className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <h3 className="text-slate-900 text-lg font-bold leading-tight">Care Circle</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-center bg-cover" style={{backgroundImage: "url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80')"}}></div>
            <div className="flex-1">
              <p className="font-bold text-slate-900">Dr. Elena Rodriguez</p>
              <p className="text-xs text-slate-500">Primary Care Physician</p>
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors" onClick={() => setActiveModal('msgDrRodriguez')}>
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-center bg-cover" style={{backgroundImage: "url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80')"}}></div>
            <div className="flex-1">
              <p className="font-bold text-slate-900">James Sterling</p>
              <p className="text-xs text-slate-500">Son • Care Coordinator</p>
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors" onClick={() => setActiveModal('msgJames')}>
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={activeModal === 'moreOptions'} onClose={() => setActiveModal(null)} title="Profile Options">
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors font-medium text-slate-700">Edit Profile</button>
          <button className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors font-medium text-slate-700">Share Records</button>
          <button className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-lg transition-colors font-medium text-red-600">Archive Client</button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'map'} onClose={() => setActiveModal(null)} title="Location">
        <div className="space-y-4">
          <div className="h-48 bg-slate-100 rounded-xl flex flex-col items-center justify-center border border-slate-200 p-4 text-center">
            <MapPin className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-slate-600 font-medium">{address || 'No address provided'}</span>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'conditions'} onClose={() => setActiveModal(null)} title="Chronic Conditions">
        <div className="space-y-4">
          {conditions.length > 0 ? (
            <ul className="space-y-3">
              {conditions.map((condition, idx) => (
                <li key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="font-bold text-slate-900">{condition}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-center py-4">No conditions reported.</p>
          )}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'medications'} onClose={() => setActiveModal(null)} title="Active Medications">
        <div className="space-y-4">
          {medications.length > 0 ? (
            <ul className="space-y-3">
              {medications.map((medication, idx) => (
                <li key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">{medication}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Active</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-center py-4">No medications reported.</p>
          )}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'allergies'} onClose={() => setActiveModal(null)} title="Allergies">
        <div className="space-y-4">
          {allergies.length > 0 ? (
            <ul className="space-y-3">
              {allergies.map((allergy, idx) => (
                <li key={idx} className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2 text-red-700 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    {allergy}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-center py-4">No allergies reported.</p>
          )}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'addContact'} onClose={() => setActiveModal(null)} title="Add Emergency Contact">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
            <input type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" placeholder="Sibling" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input type="tel" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" placeholder="+1 (555) 000-0000" />
          </div>
          <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors mt-2" onClick={() => setActiveModal(null)}>
            Save Contact
          </button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'callSarah'} onClose={() => setActiveModal(null)} title="Call Sarah Sterling">
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-2xl">
            <span className="font-bold">S</span>
          </div>
          <div className="text-center">
            <p className="font-bold text-xl text-slate-900">Sarah Sterling</p>
            <p className="text-slate-500">+1 (555) 012-3456</p>
          </div>
          <div className="flex gap-4 mt-4 w-full">
            <button className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-colors" onClick={() => setActiveModal(null)}>
              Cancel
            </button>
            <button className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2" onClick={() => setActiveModal(null)}>
              <Phone className="w-5 h-5" />
              Call Now
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'msgDrRodriguez'} onClose={() => setActiveModal(null)} title="Message Dr. Rodriguez">
        <div className="space-y-4">
          <textarea 
            className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
            placeholder="Type your message to Dr. Rodriguez..."
          ></textarea>
          <div className="flex gap-3">
            <button 
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </button>
            <button 
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              onClick={() => setActiveModal(null)}
            >
              Send Message
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'msgJames'} onClose={() => setActiveModal(null)} title="Message James Sterling">
        <div className="space-y-4">
          <textarea 
            className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
            placeholder="Type your message to James..."
          ></textarea>
          <div className="flex gap-3">
            <button 
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </button>
            <button 
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              onClick={() => setActiveModal(null)}
            >
              Send Message
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
