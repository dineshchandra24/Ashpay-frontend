import React, { useState, useEffect } from 'react';
import { Wallet, History, LogOut, ArrowDownCircle, Copy, Check, Clock, Settings, Building2, CreditCard, TrendingUp, Zap, Shield, User, X, MessageCircle } from 'lucide-react';

const AshPay = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ mobile: '', password: '', name: '', referralCode: '' });
  const [users, setUsers] = useState([]);
  const [formErrors, setFormErrors] = useState({ mobile: '', password: '' });
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('BSC');
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [liveActivities, setLiveActivities] = useState([]);
  const [bankDetails, setBankDetails] = useState({ accountName: '', accountNumber: '', ifsc: '', bankName: '' });
  const [upiId, setUpiId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [showToolsThankYou, setShowToolsThankYou] = useState(false);
  const [paymentErrors, setPaymentErrors] = useState({ accountName: '', accountNumber: '', ifsc: '', bankName: '', upiId: '' });
  const [showProfile, setShowProfile] = useState(false);
  const [passwordChange, setPasswordChange] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [showTeam, setShowTeam] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [activeTab, setActiveTab] = useState('wallet');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeletePaymentConfirm, setShowDeletePaymentConfirm] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const walletAddresses = {
    BSC: '0xc78d59e82feaf166b469a5e62d82114c1e1d3727',
    Polygon: '0xc78d59e82feaf166b469a5e62d82114c1e1d3727'
  };

  const generateCustomerId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const calculateINR = (usdtAmount) => {
    const rate = 96;
    const commission = 0.04;
    return usdtAmount * rate * (1 + commission);
  };

  useEffect(() => {
    if (currentUser) {
      setReferralCode(`ASH${currentUser.id}`);
    }
  }, [currentUser]);

  useEffect(() => {
    const generateActivity = () => {
      const randomAmount = Math.floor(Math.random() * (300 - 50 + 1)) + 50;
      const networks = ['BSC', 'Polygon'];
      const randomNetwork = networks[Math.floor(Math.random() * networks.length)];
      const randomId = Math.floor(100000 + Math.random() * 900000);
      const inrAmount = calculateINR(randomAmount);

      const activity = {
        id: Date.now(),
        customerId: randomId,
        usdtAmount: randomAmount,
        inrAmount: inrAmount,
        network: randomNetwork,
        timestamp: new Date()
      };

      setLiveActivities(prev => [activity, ...prev.slice(0, 19)]);
    };

    for (let i = 0; i < 5; i++) {
      setTimeout(generateActivity, i * 1000);
    }
    
    const interval = setInterval(() => {
      const randomDelay = Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000;
      setTimeout(generateActivity, randomDelay);
    }, 45000);
    
    return () => clearInterval(interval);
  }, []);

  const validateMobile = (mobile) => {
    if (!mobile) return 'Mobile number is required';
    if (!/^\d+$/.test(mobile)) return 'Mobile number should contain only digits';
    if (mobile.length !== 10) return 'Mobile number must be exactly 10 digits';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const mobileError = validateMobile(formData.mobile);
    const passwordError = validatePassword(formData.password);
    
    setFormErrors({ mobile: mobileError, password: passwordError });
    
    if (mobileError || passwordError || !formData.name) {
      if (!formData.name) alert('Please enter your name');
      return;
    }
    
    try {
      console.log('Sending registration request...');
      console.log('Data:', { name: formData.name, mobile: formData.mobile });
      
      const response = await fetch('https://ashpay-backend.onrender.com/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          mobile: formData.mobile,
          password: formData.password,
          referralCode: formData.referralCode || null
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        if (data.error === 'Mobile number already registered') {
          setFormErrors({ ...formErrors, mobile: 'Mobile number already registered' });
        } else {
          alert(data.error || 'Registration failed');
        }
        return;
      }

      console.log('Registration successful!');
      setCurrentUser(data.user);
      setPendingDeposits([]);
      setShowAuth(false);
      setFormData({ mobile: '', password: '', name: '', referralCode: '' });
      setFormErrors({ mobile: '', password: '' });
      alert('Registration successful! Your ID: ' + data.user.id);
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed: ' + error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const mobileError = validateMobile(formData.mobile);
    const passwordError = validatePassword(formData.password);
    
    setFormErrors({ mobile: mobileError, password: passwordError });
    
    if (mobileError || passwordError) {
      return;
    }
    
    try {
      console.log('Sending login request...');
      
      const response = await fetch('https://ashpay-backend.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: formData.mobile,
          password: formData.password
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        if (data.error === 'Invalid password') {
          setFormErrors({ ...formErrors, password: 'Incorrect password' });
        } else if (data.error === 'User not found') {
          setFormErrors({ ...formErrors, mobile: 'Mobile number not registered' });
        } else {
          alert(data.error || 'Login failed');
        }
        return;
      }

      console.log('Login successful!');
      setCurrentUser(data.user);
      setPendingDeposits([]);
      setShowAuth(false);
      setFormData({ mobile: '', password: '', name: '', referralCode: '' });
      setFormErrors({ mobile: '', password: '' });
      
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
    }
  };

  const handlePasswordChange = () => {
    setPasswordError('');
    
    if (!passwordChange.current || !passwordChange.new || !passwordChange.confirm) {
      setPasswordError('All fields are required');
      return;
    }
    
    if (passwordChange.current !== currentUser.password) {
      setPasswordError('Current password is incorrect');
      return;
    }
    
    if (passwordChange.new.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    if (passwordChange.new !== passwordChange.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    const updatedUser = { ...currentUser, password: passwordChange.new };
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    setCurrentUser(updatedUser);
    setPasswordChange({ current: '', new: '', confirm: '' });
    setShowProfile(false);
    alert('Password changed successfully!');
  };

  const handleDeposit = () => {
    if (!depositAmount || depositAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(depositAmount) < 50) {
      alert('Minimum deposit amount is 50 USDT');
      return;
    }

    const inrAmount = calculateINR(parseFloat(depositAmount));

    const pendingDeposit = {
      id: Date.now(),
      type: 'deposit',
      usdtAmount: parseFloat(depositAmount),
      inrAmount: inrAmount,
      network: selectedNetwork,
      status: 'pending'
    };

    setPendingDeposits([...pendingDeposits, pendingDeposit]);
    setDepositAmount('');
    setShowDeposit(false);
    setShowThankYou(true);
  };

  const validateBankDetails = () => {
    const errors = { accountName: '', accountNumber: '', ifsc: '', bankName: '', upiId: '' };
    let isValid = true;

    // Account Name - only alphabets and spaces
    if (!bankDetails.accountName) {
      errors.accountName = 'Account name is required';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(bankDetails.accountName)) {
      errors.accountName = 'Account name should contain only letters';
      isValid = false;
    }

    // Account Number - only numbers
    if (!bankDetails.accountNumber) {
      errors.accountNumber = 'Account number is required';
      isValid = false;
    } else if (!/^\d+$/.test(bankDetails.accountNumber)) {
      errors.accountNumber = 'Account number should contain only digits';
      isValid = false;
    } else if (bankDetails.accountNumber.length < 9 || bankDetails.accountNumber.length > 18) {
      errors.accountNumber = 'Account number should be between 9-18 digits';
      isValid = false;
    }

    // IFSC Code
    if (!bankDetails.ifsc) {
      errors.ifsc = 'IFSC code is required';
      isValid = false;
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifsc)) {
      errors.ifsc = 'Invalid IFSC code format';
      isValid = false;
    }

    // Bank Name - only alphabets and spaces
    if (!bankDetails.bankName) {
      errors.bankName = 'Bank name is required';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(bankDetails.bankName)) {
      errors.bankName = 'Bank name should contain only letters';
      isValid = false;
    }

    setPaymentErrors(errors);
    return isValid;
  };

  const validateUPI = () => {
    const errors = { accountName: '', accountNumber: '', ifsc: '', bankName: '', upiId: '' };
    let isValid = true;

    // UPI format: abcd@xyz
    if (!upiId) {
      errors.upiId = 'UPI ID is required';
      isValid = false;
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId)) {
      errors.upiId = 'Invalid UPI format (e.g., username@bank)';
      isValid = false;
    }

    setPaymentErrors(errors);
    return isValid;
  };

  const savePaymentDetails = () => {
    const savedPaymentDetails = currentUser.paymentDetails || [];
    
    if (savedPaymentDetails.length >= 6) {
      alert('Maximum 6 payment methods allowed');
      return;
    }
    
    if (paymentMethod === 'bank') {
      if (!validateBankDetails()) {
        return;
      }
      const details = { id: Date.now(), type: 'bank', ...bankDetails };
      const updatedDetails = [...savedPaymentDetails, details];
      const updatedUser = { ...currentUser, paymentDetails: updatedDetails };
      const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      setCurrentUser(updatedUser);
      setBankDetails({ accountName: '', accountNumber: '', ifsc: '', bankName: '' });
      setPaymentErrors({ accountName: '', accountNumber: '', ifsc: '', bankName: '', upiId: '' });
      setShowToolsThankYou(true);
    } else {
      if (!validateUPI()) {
        return;
      }
      const details = { id: Date.now(), type: 'upi', upiId };
      const updatedDetails = [...savedPaymentDetails, details];
      const updatedUser = { ...currentUser, paymentDetails: updatedDetails };
      const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      setCurrentUser(updatedUser);
      setUpiId('');
      setPaymentErrors({ accountName: '', accountNumber: '', ifsc: '', bankName: '', upiId: '' });
      setShowToolsThankYou(true);
    }
  };

  const removePaymentDetails = (id) => {
    const updatedDetails = (currentUser.paymentDetails || []).filter(detail => detail.id !== id);
    const updatedUser = { ...currentUser, paymentDetails: updatedDetails };
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    setCurrentUser(updatedUser);
    setShowDeletePaymentConfirm(false);
    setPaymentToDelete(null);
  };

  const confirmDeletePayment = (id) => {
    setPaymentToDelete(id);
    setShowDeletePaymentConfirm(true);
  };

  const completePendingDeposit = (depositId) => {
    const deposit = pendingDeposits.find(d => d.id === depositId);
    if (!deposit) return;

    const completedTransaction = {
      ...deposit,
      status: 'completed',
      date: new Date().toISOString()
    };

    const updatedUser = {
      ...currentUser,
      balance: currentUser.balance + deposit.inrAmount,
      transactions: [completedTransaction, ...currentUser.transactions]
    };

    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    setCurrentUser(updatedUser);
    setPendingDeposits(prev => prev.filter(d => d.id !== depositId));
  };

  // Function to fetch balance from backend
  const fetchBalanceFromBackend = async (userId) => {
    try {
      setIsRefreshing(true);
      console.log('Fetching balance for userId:', userId);
      
      // Using CORS proxy temporarily
      const response = await fetch(`https://ashpay-api.onrender.com/api/balance/${userId}`, {
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      console.log('Balance data received:', data);
      
      // Update the user's balance
      const updatedUser = {
        ...currentUser,
        balance: data.balance || currentUser.balance,
        transactions: data.transactions || currentUser.transactions
      };

      const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      setCurrentUser(updatedUser);

      setIsRefreshing(false);
      return data;
    } catch (error) {
      console.error('Error fetching balance:', error);
      setIsRefreshing(false);
      // Silently fail and keep existing balance
      return null;
    }
  };

  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    if (!currentUser) return;

    // Fetch immediately on login
    fetchBalanceFromBackend(currentUser.id);

    // Set up interval to fetch periodically
    const interval = setInterval(() => {
      fetchBalanceFromBackend(currentUser.id);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const calculatePendingBalance = () => {
    return pendingDeposits.reduce((sum, deposit) => sum + deposit.inrAmount, 0);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddresses[selectedNetwork]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowAuth(true);
    setShowDeposit(false);
    setShowHistory(false);
    setShowTools(false);
    setShowProfile(false);
    setShowTeam(false);
    setShowWallet(false);
    setShowSupport(false);
    setShowLogoutConfirm(false);
    setPendingDeposits([]);
    setActiveTab('wallet');
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const openTab = (tabName) => {
    // Close all tabs first
    setShowWallet(false);
    setShowTools(false);
    setShowTeam(false);
    setShowProfile(false);
    
    // Open the selected tab
    setActiveTab(tabName);
    if (tabName === 'wallet') setShowWallet(true);
    if (tabName === 'payment') setShowTools(true);
    if (tabName === 'team') setShowTeam(true);
    if (tabName === 'profile') setShowProfile(true);
  };

  const closeAllTabs = () => {
    setShowWallet(false);
    setShowTools(false);
    setShowTeam(false);
    setShowProfile(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-4 shadow-lg">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">AshPay</h1>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                isLogin ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white/10 text-gray-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                !isLogin ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white/10 text-gray-300'
              }`}
            >
              Register
            </button>
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Referral Code (Optional)"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400"
                />
              </>
            )}
            <div>
              <input
                type="tel"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, mobile: value });
                  setFormErrors({ ...formErrors, mobile: '' });
                }}
                className={`w-full px-4 py-3 bg-white/10 border ${formErrors.mobile ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-gray-400`}
              />
              {formErrors.mobile && <p className="text-red-400 text-sm mt-1">{formErrors.mobile}</p>}
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setFormErrors({ ...formErrors, password: '' });
                }}
                className={`w-full px-4 py-3 bg-white/10 border ${formErrors.password ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-gray-400`}
              />
              {formErrors.password && <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                isLogin ? handleLogin(e) : handleRegister(e);
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold"
            >
              {isLogin ? 'Login' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 pb-20">
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">AshPay</h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSupport(true)} 
                className="px-3 py-2 bg-white/10 rounded-xl active:scale-95 transition-transform flex items-center gap-1"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Support</span>
              </button>
              <button onClick={confirmLogout} className="px-3 py-2 bg-white/10 rounded-xl active:scale-95 transition-transform flex items-center gap-1">
                <LogOut className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 mb-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-lg text-white mb-1">{getGreeting()}, {currentUser.name}!</h2>
              <p className="text-gray-400 text-xs mb-3">ID: {currentUser.id}</p>
            </div>
            <button
              onClick={() => fetchBalanceFromBackend(currentUser.id)}
              disabled={isRefreshing}
              className={`p-2 bg-white/10 rounded-xl active:scale-95 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh Balance"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <div className="text-3xl font-bold text-white mb-2">₹{currentUser.balance.toFixed(2)}</div>
          <p className="text-gray-300 text-sm mb-3">Available Balance</p>
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-3 border border-purple-500/30">
            <p className="text-white text-base font-bold mb-1">1 USDT = ₹96</p>
            <p className="text-yellow-400 text-sm font-bold">+4% Commission Applied</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setShowDeposit(true)}
            className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 p-5 rounded-2xl text-white shadow-xl active:scale-95 transition-transform"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full -ml-6 -mb-6"></div>
            <div className="relative">
              <div className="bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm w-12 h-12 rounded-xl flex items-center justify-center mb-2 shadow-lg border border-white/20">
                <ArrowDownCircle className="w-6 h-6 drop-shadow-lg" strokeWidth={2.5} />
              </div>
              <div className="text-lg font-bold mb-1 drop-shadow-md">Deposit</div>
              <div className="text-white/90 text-xs font-medium">Add funds instantly</div>
            </div>
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 p-5 rounded-2xl text-white shadow-xl active:scale-95 transition-transform"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full -ml-6 -mb-6"></div>
            <div className="relative">
              <div className="bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm w-12 h-12 rounded-xl flex items-center justify-center mb-2 shadow-lg border border-white/20">
                <History className="w-6 h-6 drop-shadow-lg" strokeWidth={2.5} />
              </div>
              <div className="text-lg font-bold mb-1 drop-shadow-md">History</div>
              <div className="text-white/90 text-xs font-medium">View transactions</div>
            </div>
          </button>
        </div>

        {pendingDeposits.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 mb-4">
            <h3 className="text-base font-semibold text-white mb-3">Pending Deposits</h3>
            {pendingDeposits.map(deposit => (
              <div key={deposit.id} className="bg-white/5 p-3 rounded-xl mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-white font-semibold text-sm">{deposit.usdtAmount} USDT</div>
                    <div className="text-gray-300 text-xs">{deposit.network}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold text-sm">₹{deposit.inrAmount.toFixed(2)}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-2 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">Processing...</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-4 border border-yellow-500/30 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-orange-400/10 rounded-full -ml-10 -mb-10"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2.5 rounded-xl">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Refer & Earn!</h3>
                <p className="text-yellow-200 text-xs">Earn instant rewards</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-400 font-bold text-base">₹</span>
                </div>
                <p className="text-white font-semibold text-sm">Get ₹200 instantly on their 1st deposit</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold text-base">%</span>
                </div>
                <p className="text-white font-semibold text-sm">Earn 1% commission on every deposit</p>
              </div>
            </div>
            <button
              onClick={() => setShowTeam(true)}
              className="w-full mt-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-2.5 rounded-xl active:scale-95 transition-transform"
            >
              Get Your Referral Code
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
          <h3 className="text-base font-semibold text-white mb-3">Live Activity</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {liveActivities.map(activity => (
              <div key={activity.id} className="bg-white/5 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-semibold text-sm">{activity.usdtAmount} USDT</div>
                    <div className="text-gray-300 text-xs">ID: {activity.customerId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-semibold text-sm">₹{activity.inrAmount.toFixed(2)}</div>
                    <div className="text-gray-400 text-xs">{activity.network}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDeposit && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-violet-900 to-purple-900 rounded-3xl p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDeposit(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-4">Deposit USDT</h2>
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-3 mb-3">
              <p className="text-yellow-400 text-xs font-semibold">⚠️ Minimum deposit: 50 USDT</p>
            </div>
            <input
              type="number"
              placeholder="Amount in USDT (Min: 50)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              min="50"
              className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white mb-3 text-sm"
            />
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white mb-3 text-sm"
            >
              <option value="BSC">BSC (BEP20)</option>
              <option value="Polygon">Polygon</option>
            </select>
            <div className="bg-white/10 p-3 rounded-xl mb-3">
              <p className="text-gray-300 text-xs mb-2">Wallet Address:</p>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={walletAddresses[selectedNetwork]}
                  readOnly
                  className="flex-1 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs break-all"
                />
                <button onClick={copyAddress} className="p-2 bg-purple-500 rounded-lg flex-shrink-0">
                  {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>
            {depositAmount && (
              <div className="bg-white/10 p-3 rounded-xl mb-3">
                <p className="text-white text-sm">You will receive: ₹{calculateINR(parseFloat(depositAmount)).toFixed(2)}</p>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeposit(false)}
                className="flex-1 bg-white/10 text-white py-2.5 rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-xl text-sm font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showThankYou && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-violet-900 to-purple-900 rounded-3xl p-8 max-w-md w-full text-center relative">
            <button
              onClick={() => setShowThankYou(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
            <p className="text-gray-300 mb-6">Your deposit request has been submitted</p>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-violet-900 to-purple-900 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => setShowHistory(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
            
            {pendingDeposits.length > 0 && (
              <div className="mb-4">
                <h3 className="text-base font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending Deposits
                </h3>
                <div className="space-y-2">
                  {pendingDeposits.map(tx => (
                    <div key={tx.id} className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-white font-semibold text-sm">{tx.usdtAmount} USDT</div>
                          <div className="text-gray-300 text-xs">{tx.network}</div>
                          <div className="text-yellow-400 text-xs mt-1 font-medium">Processing...</div>
                        </div>
                        <div className="text-yellow-400 font-semibold text-sm">₹{tx.inrAmount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 bg-white/10 p-2.5 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-semibold text-sm">Total Pending Balance:</span>
                    <span className="text-yellow-400 font-bold text-base">₹{calculatePendingBalance().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <h3 className="text-base font-semibold text-white mb-3">Completed Transactions</h3>
            {currentUser.transactions && currentUser.transactions.length > 0 ? (
              <div className="space-y-2">
                {currentUser.transactions.map(tx => (
                  <div key={tx.id} className="bg-white/10 p-3 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-semibold text-sm">{tx.usdtAmount} USDT</div>
                        <div className="text-gray-300 text-xs">{new Date(tx.date).toLocaleString()}</div>
                      </div>
                      <div className="text-green-400 font-semibold text-sm">₹{tx.inrAmount.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-300 text-center py-6 text-sm">No completed transactions yet</p>
            )}
          </div>
        </div>
      )}

      {showTools && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-violet-900 to-purple-900 rounded-3xl p-6 max-w-2xl w-full my-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowTools(false);
                setActiveTab('wallet');
              }}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-4">Payment Details</h2>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPaymentMethod('bank')}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm ${
                  paymentMethod === 'bank' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white/10 text-gray-300'
                }`}
              >
                Bank Account
              </button>
              <button
                onClick={() => setPaymentMethod('upi')}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm ${
                  paymentMethod === 'upi' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white/10 text-gray-300'
                }`}
              >
                UPI
              </button>
            </div>

            {paymentMethod === 'bank' ? (
              <div className="space-y-3 mb-4">
                <div>
                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    value={bankDetails.accountName}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      setBankDetails({ ...bankDetails, accountName: value });
                      setPaymentErrors({ ...paymentErrors, accountName: '' });
                    }}
                    className={`w-full px-3 py-2.5 bg-white/10 border ${paymentErrors.accountName ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-gray-400 text-sm`}
                  />
                  {paymentErrors.accountName && <p className="text-red-400 text-xs mt-1">{paymentErrors.accountName}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={bankDetails.accountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setBankDetails({ ...bankDetails, accountNumber: value });
                      setPaymentErrors({ ...paymentErrors, accountNumber: '' });
                    }}
                    className={`w-full px-3 py-2.5 bg-white/10 border ${paymentErrors.accountNumber ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-gray-400 text-sm`}
                  />
                  {paymentErrors.accountNumber && <p className="text-red-400 text-xs mt-1">{paymentErrors.accountNumber}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    value={bankDetails.ifsc}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      setBankDetails({ ...bankDetails, ifsc: value });
                      setPaymentErrors({ ...paymentErrors, ifsc: '' });
                    }}
                    className={`w-full px-3 py-2.5 bg-white/10 border ${paymentErrors.ifsc ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-gray-400 text-sm`}
                  />
                  {paymentErrors.ifsc && <p className="text-red-400 text-xs mt-1">{paymentErrors.ifsc}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={bankDetails.bankName}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      setBankDetails({ ...bankDetails, bankName: value });
                      setPaymentErrors({ ...paymentErrors, bankName: '' });
                    }}
                    className={`w-full px-3 py-2.5 bg-white/10 border ${paymentErrors.bankName ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-gray-400 text-sm`}
                  />
                  {paymentErrors.bankName && <p className="text-red-400 text-xs mt-1">{paymentErrors.bankName}</p>}
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="UPI ID (e.g., username@paytm)"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value.toLowerCase());
                    setPaymentErrors({ ...paymentErrors, upiId: '' });
                  }}
                  className={`w-full px-3 py-2.5 bg-white/10 border ${paymentErrors.upiId ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-gray-400 text-sm`}
                />
                {paymentErrors.upiId && <p className="text-red-400 text-xs mt-1">{paymentErrors.upiId}</p>}
              </div>
            )}

            <button
              onClick={savePaymentDetails}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl mb-4 text-sm font-semibold"
            >
              Save Payment Details
            </button>

            {currentUser.paymentDetails && currentUser.paymentDetails.length > 0 && (
              <div className="mt-4">
                <h3 className="text-base font-semibold text-white mb-3">Saved Payment Methods</h3>
                <div className="space-y-2">
                  {currentUser.paymentDetails.map(detail => (
                    <div key={detail.id} className="bg-white/10 p-3 rounded-xl flex justify-between items-center">
                      <div>
                        {detail.type === 'bank' ? (
                          <>
                            <div className="text-white font-semibold text-sm">{detail.accountName}</div>
                            <div className="text-gray-300 text-xs">{detail.bankName} - {detail.accountNumber}</div>
                            <div className="text-gray-400 text-xs">{detail.ifsc}</div>
                          </>
                        ) : (
                          <>
                            <div className="text-white font-semibold text-sm">UPI</div>
                            <div className="text-gray-300 text-xs">{detail.upiId}</div>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => confirmDeletePayment(detail.id)}
                        className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors active:scale-95"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showDeletePaymentConfirm && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60]">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <X className="w-7 h-7 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Payment Method?</h3>
                  <p className="text-gray-600 text-sm mb-4">Are you sure you want to remove this payment method?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowDeletePaymentConfirm(false);
                        setPaymentToDelete(null);
                      }}
                      className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-xl font-semibold hover:bg-gray-300 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => removePaymentDetails(paymentToDelete)}
                      className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showToolsThankYou && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-violet-900 to-purple-900 rounded-3xl p-8 max-w-md w-full text-center relative">
            <button
              onClick={() => setShowToolsThankYou(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
            <p className="text-gray-300 mb-6">Payment details saved successfully</p>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-violet-900 to-purple-900 rounded-3xl p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowProfile(false);
                setPasswordChange({ current: '', new: '', confirm: '' });
                setPasswordError('');
                setActiveTab('wallet');
              }}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-4">Profile</h2>
            
            <div className="bg-white/10 p-3 rounded-xl mb-4 space-y-2">
              <div>
                <p className="text-gray-400 text-xs">User ID</p>
                <p className="text-white font-semibold text-sm">{currentUser.id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Name</p>
                <p className="text-white font-semibold text-sm">{currentUser.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Mobile Number</p>
                <p className="text-white font-semibold text-sm">{currentUser.mobile}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <h3 className="text-base font-semibold text-white">Change Password</h3>
              <input
                type="password"
                placeholder="Current Password"
                value={passwordChange.current}
                onChange={(e) => setPasswordChange({ ...passwordChange, current: e.target.value })}
                className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordChange.new}
                onChange={(e) => setPasswordChange({ ...passwordChange, new: e.target.value })}
                className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordChange.confirm}
                onChange={(e) => setPasswordChange({ ...passwordChange, confirm: e.target.value })}
                className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm"
              />
              {passwordError && <p className="text-red-400 text-xs">{passwordError}</p>}
            </div>
            <button
              onClick={handlePasswordChange}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl text-sm font-semibold"
            >
              Update Password
            </button>
          </div>
        </div>
      )}

      {showTeam && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-violet-900 to-purple-900 rounded-3xl p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowTeam(false);
                setActiveTab('wallet');
              }}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-4">My Team</h2>
            
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-4 border border-yellow-500/30 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Referral Benefits</h3>
                  <p className="text-yellow-200 text-xs">Earn with every referral</p>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold text-lg">₹</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">₹200 Instant Bonus</p>
                    <p className="text-gray-300 text-xs">When they make their 1st deposit</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400 font-bold text-lg">1%</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">1% Lifetime Commission</p>
                    <p className="text-gray-300 text-xs">On every deposit they make forever</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 p-3 rounded-xl">
                <p className="text-gray-300 text-xs mb-2 font-semibold">Your Referral Code:</p>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="flex-1 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-bold min-w-0 overflow-hidden"
                  />
                  <button onClick={copyReferralCode} className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex-shrink-0">
                    {copiedReferral ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/10 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">Total Referrals</span>
                <span className="text-white font-bold text-lg">{currentUser.referrals?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Commission Earned</span>
                <span className="text-green-400 font-bold text-lg">₹{currentUser.referralCommission || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWallet && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-violet-900 to-purple-900 rounded-3xl p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowWallet(false);
                setActiveTab('wallet');
              }}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-4">My Wallet</h2>
            
            <div className="space-y-3 mb-4">
              <div className="bg-white/10 p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-xs">Available Balance</p>
                    <p className="text-white text-xl font-bold">₹{currentUser.balance.toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-xs">Ready to withdraw or use</p>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-xs">Pending Balance</p>
                    <p className="text-white text-xl font-bold">₹{calculatePendingBalance().toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-xs">Processing deposits</p>
              </div>

              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-2xl border border-purple-500/30">
                <div className="flex items-center gap-2">
                  <Shield className="w-7 h-7 text-purple-400" />
                  <div>
                    <p className="text-gray-300 text-xs">Total Balance</p>
                    <p className="text-white text-2xl font-bold">₹{currentUser.balance.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Logout?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout from your account?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}



      {showSupport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-violet-900 to-purple-900 rounded-3xl p-8 max-w-md w-full text-center relative">
            <button
              onClick={() => setShowSupport(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl mb-6 shadow-lg">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Customer Support</h2>
            <p className="text-gray-300 mb-6">Choose your preferred way to contact us</p>
            
            <div className="space-y-3">
              <a
                href="https://tawk.to/chat/68e9e2d6ca0084195466fbe0/1j78ps654"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-shadow"
              >
                <MessageCircle className="w-6 h-6" />
                Live Chat Support
              </a>
              
              <a
                href="http://telegram.me/Ashpay_Support"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-shadow"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
                Telegram Support
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 safe-area-bottom z-50">
        <div className="px-2 py-2.5">
          <div className="flex justify-around">
            <button 
              onClick={() => openTab('wallet')}
              className={`flex flex-col items-center gap-0.5 min-w-[60px] py-1 active:scale-95 transition-transform ${activeTab === 'wallet' ? 'text-white' : 'text-gray-400'}`}
            >
              <Wallet className="w-6 h-6" />
              <span className="text-xs font-medium">Wallet</span>
            </button>
            <button
              onClick={() => openTab('payment')}
              className={`flex flex-col items-center gap-0.5 min-w-[60px] py-1 active:scale-95 transition-transform ${activeTab === 'payment' ? 'text-white' : 'text-gray-400'}`}
            >
              <CreditCard className="w-6 h-6" />
              <span className="text-xs font-medium">Payment</span>
            </button>
            <button
              onClick={() => openTab('team')}
              className={`flex flex-col items-center gap-0.5 min-w-[60px] py-1 active:scale-95 transition-transform ${activeTab === 'team' ? 'text-white' : 'text-gray-400'}`}
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-xs font-medium">Team</span>
            </button>
            <button
              onClick={() => openTab('profile')}
              className={`flex flex-col items-center gap-0.5 min-w-[60px] py-1 active:scale-95 transition-transform ${activeTab === 'profile' ? 'text-white' : 'text-gray-400'}`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AshPay;