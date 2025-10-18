import React, { useState, useEffect } from 'react';
import { Wallet, History, LogOut, ArrowDownCircle, Copy, Check, Clock, CreditCard, TrendingUp, Zap, User, X, MessageCircle, Loader2 } from 'lucide-react';

const AshPay = () => {
  const calculateINR = (usdtAmount) => {
    const rate = 96;
    const commission = 0.04;
    return usdtAmount * rate * (1 + commission);
  };

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
  const [showTools, setShowTools] = useState(false);
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [liveActivities, setLiveActivities] = useState([]);
  const [bankDetails, setBankDetails] = useState({ accountName: '', accountNumber: '', ifsc: '', bankName: '' });
  const [upiId, setUpiId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [paymentErrors, setPaymentErrors] = useState({ accountName: '', accountNumber: '', ifsc: '', bankName: '', upiId: '' });
  const [showProfile, setShowProfile] = useState(false);
  const [passwordChange, setPasswordChange] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [showTeam, setShowTeam] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [activeTab, setActiveTab] = useState('wallet');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeletePaymentConfirm, setShowDeletePaymentConfirm] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [tawkLoaded, setTawkLoaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const paymentMethodsRef = React.useRef(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isConfirmingDeposit, setIsConfirmingDeposit] = useState(false);

  const walletAddresses = {
    BSC: '0xc78d59e82feaf166b469a5e62d82114c1e1d3727',
    Polygon: '0xc78d59e82feaf166b469a5e62d82114c1e1d3727'
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('ashpay_user');
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log('Restored user from localStorage:', user);
        console.log('Payment details on restore:', user.paymentDetails);
        setCurrentUser(user);
        setShowAuth(false);
        console.log('User session restored');
        
        // Fetch latest user data from backend to sync payment methods
        fetchUserData(user.id);
        fetchPendingDeposits(user.id);
      } catch (error) {
        console.error('Error restoring session:', error);
        localStorage.removeItem('ashpay_user');
      }
    }
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`https://ashpay-backend.onrender.com/api/user/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched user data from backend:', data.user);
        console.log('Payment details from backend:', data.user.paymentDetails);
        
        // Only update if we have valid data and payment details exist
        if (data.user && data.user.paymentDetails) {
          setCurrentUser(prevUser => ({
            ...prevUser,
            ...data.user,
            paymentDetails: data.user.paymentDetails
          }));
          localStorage.setItem('ashpay_user', JSON.stringify(data.user));
          console.log('User data synced from backend with payment details');
        } else {
          // If no payment details from backend, just update other fields
          console.log('No payment details from backend, keeping existing ones');
          setCurrentUser(prevUser => ({
            ...prevUser,
            balance: data.user?.balance || prevUser.balance,
            transactions: data.user?.transactions || prevUser.transactions
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchPendingDeposits = async (userId) => {
    try {
      const response = await fetch(`https://ashpay-backend.onrender.com/api/user/${userId}/pending-deposits`);
      
      if (response.ok) {
        const data = await response.json();
        setPendingDeposits(data.pendingDeposits || []);
      }
    } catch (error) {
      console.error('Error fetching pending deposits:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ashpay_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ashpay_user');
    }
  }, [currentUser]);

  useEffect(() => {
    const handleBackButton = (e) => {
      e.preventDefault();
      
      if (showDeletePaymentConfirm) {
        setShowDeletePaymentConfirm(false);
        window.history.pushState(null, '', window.location.href);
        return;
      }
      if (showLogoutConfirm) {
        setShowLogoutConfirm(false);
        window.history.pushState(null, '', window.location.href);
        return;
      }
      
      if (showDeposit) {
        setShowDeposit(false);
        window.history.pushState(null, '', window.location.href);
        return;
      }
      if (showHistory) {
        setShowHistory(false);
        window.history.pushState(null, '', window.location.href);
        return;
      }
      if (showSupport) {
        setShowSupport(false);
        window.history.pushState(null, '', window.location.href);
        return;
      }
      
      if (activeTab !== 'wallet') {
        setShowTools(false);
        setShowProfile(false);
        setShowTeam(false);
        setActiveTab('wallet');
        window.history.pushState(null, '', window.location.href);
        return;
      }
      
      if (currentUser && !showAuth && activeTab === 'wallet') {
        if (window.confirm('Do you want to exit the app?')) {
          window.close();
        }
        window.history.pushState(null, '', window.location.href);
        return;
      }
    };

    window.addEventListener('popstate', handleBackButton);
    window.history.pushState(null, '', window.location.href);
    
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [showDeposit, showHistory, showTools, showProfile, showTeam, showSupport, showLogoutConfirm, showDeletePaymentConfirm, currentUser, showAuth, activeTab]);

  useEffect(() => {
    if (currentUser) {
      setReferralCode(`ASH${currentUser.id}`);
    }
  }, [currentUser]);

  const openTawkChat = () => {
    if (!window.Tawk_API) {
      // Load Tawk script on demand
      var Tawk_API = window.Tawk_API || {};
      var Tawk_LoadStart = new Date();
      
      (function(){
        var s1 = document.createElement("script");
        var s0 = document.getElementsByTagName("script")[0];
        s1.async = true;
        s1.src = 'https://embed.tawk.to/68e9e2d6ca0084195466fbe0/1j78ps654';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin','*');
        
        s1.onload = function() {
          if (window.Tawk_API) {
            window.Tawk_API.onLoad = function() {
              console.log('Tawk.to chat loaded');
              window.Tawk_API.setAttributes({
                'name': currentUser?.name || 'Guest',
                'userId': currentUser?.id || 'N/A'
              });
              window.Tawk_API.showWidget();
            };
          }
        };
        
        s0.parentNode.insertBefore(s1, s0);
      })();
    } else {
      window.Tawk_API.showWidget();
    }
  };

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
    
    setIsRegistering(true);
    
    try {
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

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Mobile number already registered') {
          setFormErrors({ ...formErrors, mobile: 'Mobile number already registered' });
        } else {
          alert(data.error || 'Registration failed');
        }
        setIsRegistering(false);
        return;
      }

      const user = data.user;
      setCurrentUser(user);
      localStorage.setItem('ashpay_user', JSON.stringify(user));
      setPendingDeposits([]);
      setShowAuth(false);
      setFormData({ mobile: '', password: '', name: '', referralCode: '' });
      setFormErrors({ mobile: '', password: '' });
      setIsRegistering(false);
      
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message.includes('Failed to fetch')) {
        alert('Server is waking up, please wait 30 seconds and try again');
      } else {
        alert('Registration failed: ' + error.message);
      }
      setIsRegistering(false);
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
    
    setIsLoggingIn(true);
    
    try {
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

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Invalid password') {
          setFormErrors({ ...formErrors, password: 'Incorrect password' });
        } else if (data.error === 'User not found') {
          setFormErrors({ ...formErrors, mobile: 'Mobile number not registered' });
        } else {
          alert(data.error || 'Login failed');
        }
        setIsLoggingIn(false);
        return;
      }

      const user = data.user;
      setCurrentUser(user);
      localStorage.setItem('ashpay_user', JSON.stringify(user));
      setPendingDeposits([]);
      setShowAuth(false);
      setFormData({ mobile: '', password: '', name: '', referralCode: '' });
      setFormErrors({ mobile: '', password: '' });
      setIsLoggingIn(false);
      
    } catch (error) {
      console.error('Login error:', error);
      if (error.message.includes('Failed to fetch')) {
        alert('Server is waking up, please wait 30 seconds and try again');
      } else {
        alert('Login failed: ' + error.message);
      }
      setIsLoggingIn(false);
    }
  };

  const handlePasswordChange = async () => {
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
    
    try {
      const response = await fetch('https://ashpay-backend.onrender.com/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPassword: passwordChange.current,
          newPassword: passwordChange.new
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        const updatedUser = { ...currentUser, password: passwordChange.new };
        const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
        setUsers(updatedUsers);
        setCurrentUser(updatedUser);
        setPasswordChange({ current: '', new: '', confirm: '' });
        setShowProfile(false);
        alert('Password changed successfully!');
      } else {
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Failed to change password');
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || depositAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(depositAmount) < 50) {
      alert('Minimum deposit amount is 50 USDT');
      return;
    }

    setIsConfirmingDeposit(true);

    const inrAmount = calculateINR(parseFloat(depositAmount));

    const pendingDeposit = {
      id: Date.now(),
      type: 'deposit',
      usdtAmount: parseFloat(depositAmount),
      inrAmount: inrAmount,
      network: selectedNetwork,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`https://ashpay-backend.onrender.com/api/user/${currentUser.id}/pending-deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pendingDeposit)
      });

      if (!response.ok) {
        throw new Error('Failed to save deposit');
      }

      const data = await response.json();
      
      setCurrentUser(data.user);
      setPendingDeposits(data.user.pendingDeposits || []);
      setDepositAmount('');
      setIsConfirmingDeposit(false);
      setShowDeposit(false);
      
    } catch (error) {
      console.error('Error saving deposit:', error);
      setIsConfirmingDeposit(false);
      alert('Failed to submit deposit request. Please try again.');
    }
  };

  const validateBankDetails = () => {
    const errors = { accountName: '', accountNumber: '', ifsc: '', bankName: '', upiId: '' };
    let isValid = true;

    if (!bankDetails.accountName) {
      errors.accountName = 'Account name is required';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(bankDetails.accountName)) {
      errors.accountName = 'Account name should contain only letters';
      isValid = false;
    }

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

    if (!bankDetails.ifsc) {
      errors.ifsc = 'IFSC code is required';
      isValid = false;
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifsc)) {
      errors.ifsc = 'Invalid IFSC code format';
      isValid = false;
    }

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

  const savePaymentDetails = async () => {
    const savedPaymentDetails = currentUser.paymentDetails || [];
    
    if (savedPaymentDetails.length >= 6) {
      alert('Maximum 6 payment methods allowed');
      return;
    }
    
    setIsSavingPayment(true);
    
    if (paymentMethod === 'bank') {
      if (!validateBankDetails()) {
        setIsSavingPayment(false);
        return;
      }
      const details = { id: Date.now(), type: 'bank', ...bankDetails };
      // Add new payment method at the beginning (top) of the array
      const updatedDetails = [details, ...savedPaymentDetails];
      
      try {
        const response = await fetch(`https://ashpay-backend.onrender.com/api/user/${currentUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentDetails: updatedDetails
          })
        });

        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${responseText}`);
        }

        const data = JSON.parse(responseText);
        
        console.log('Backend response:', data);
        console.log('User data from backend:', data.user);
        console.log('Payment details:', data.user?.paymentDetails);
        
        // Update state with new user data - make sure to preserve all fields
        const updatedUser = {
          ...currentUser,
          ...data.user,
          paymentDetails: data.user.paymentDetails || []
        };
        
        console.log('Updated user object:', updatedUser);
        
        setCurrentUser(updatedUser);
        localStorage.setItem('ashpay_user', JSON.stringify(updatedUser));
        
        const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
        setUsers(updatedUsers);
        
        // Clear form
        setBankDetails({ accountName: '', accountNumber: '', ifsc: '', bankName: '' });
        setPaymentErrors({ accountName: '', accountNumber: '', ifsc: '', bankName: '', upiId: '' });
        setIsSavingPayment(false);
        
        // Show success message
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        
        // Scroll to saved payment methods section
        setTimeout(() => {
          if (paymentMethodsRef.current) {
            paymentMethodsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
        
      } catch (error) {
        console.error('Error saving payment details:', error);
        setIsSavingPayment(false);
        if (error.message.includes('Failed to fetch')) {
          alert('❌ Server is starting up. Please wait 30 seconds and try again.');
        } else {
          alert('❌ Failed to save payment details: ' + error.message);
        }
      }
    } else {
      if (!validateUPI()) {
        setIsSavingPayment(false);
        return;
      }
      const details = { id: Date.now(), type: 'upi', upiId };
      // Add new payment method at the beginning (top) of the array
      const updatedDetails = [details, ...savedPaymentDetails];
      
      try {
        const response = await fetch(`https://ashpay-backend.onrender.com/api/user/${currentUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentDetails: updatedDetails
          })
        });

        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${responseText}`);
        }

        const data = JSON.parse(responseText);
        
        console.log('Backend response:', data);
        console.log('User data from backend:', data.user);
        console.log('Payment details:', data.user?.paymentDetails);
        
        // Update state with new user data - make sure to preserve all fields
        const updatedUser = {
          ...currentUser,
          ...data.user,
          paymentDetails: data.user.paymentDetails || []
        };
        
        console.log('Updated user object:', updatedUser);
        
        setCurrentUser(updatedUser);
        localStorage.setItem('ashpay_user', JSON.stringify(updatedUser));
        
        const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
        setUsers(updatedUsers);
        
        // Clear form
        setUpiId('');
        setPaymentErrors({ accountName: '', accountNumber: '', ifsc: '', bankName: '', upiId: '' });
        setIsSavingPayment(false);
        
        // Show success message
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        
        // Scroll to saved payment methods section
        setTimeout(() => {
          if (paymentMethodsRef.current) {
            paymentMethodsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
        
      } catch (error) {
        console.error('Error saving payment details:', error);
        setIsSavingPayment(false);
        if (error.message.includes('Failed to fetch')) {
          alert('❌ Server is starting up. Please wait 30 seconds and try again.');
        } else {
          alert('❌ Failed to save payment details: ' + error.message);
        }
      }
    }
  };

  const removePaymentDetails = async (id) => {
    const updatedDetails = (currentUser.paymentDetails || []).filter(detail => detail.id !== id);
    
    try {
      const response = await fetch(`https://ashpay-backend.onrender.com/api/user/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentDetails: updatedDetails
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        const updatedUser = {
          ...currentUser,
          paymentDetails: updatedDetails
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('ashpay_user', JSON.stringify(updatedUser));
        
        const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
        setUsers(updatedUsers);
        setShowDeletePaymentConfirm(false);
        setPaymentToDelete(null);
        
        console.log('Payment method deleted, updated user:', updatedUser);
      } else {
        alert('❌ Failed to delete: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert('❌ Failed to delete payment method. Please check your connection.');
    }
  };

  const confirmDeletePayment = (id) => {
    setPaymentToDelete(id);
    setShowDeletePaymentConfirm(true);
  };

  const fetchBalanceFromBackend = async (userId) => {
    try {
      setIsRefreshing(true);
      
      const response = await fetch(`https://ashpay-backend.onrender.com/api/balance/${userId}`, {
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      
      // CRITICAL: Only update balance and transactions, preserve payment methods
      setCurrentUser(prevUser => {
        const updatedUser = {
          ...prevUser,
          balance: data.balance || prevUser.balance,
          transactions: data.transactions || prevUser.transactions,
          // Keep existing payment methods - don't overwrite
          paymentDetails: prevUser.paymentDetails || []
        };
        
        // Update localStorage with preserved payment methods
        localStorage.setItem('ashpay_user', JSON.stringify(updatedUser));
        return updatedUser;
      });

      const updatedUsers = users.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            balance: data.balance || u.balance,
            transactions: data.transactions || u.transactions,
            paymentDetails: u.paymentDetails || []
          };
        }
        return u;
      });
      setUsers(updatedUsers);

      setIsRefreshing(false);
      return data;
    } catch (error) {
      console.error('Error fetching balance:', error);
      setIsRefreshing(false);
      return null;
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    // Don't fetch balance immediately on mount - payment methods are already in state
    // Only start the interval
    const interval = setInterval(() => {
      fetchBalanceFromBackend(currentUser.id);
    }, 30000); // Fetch every 30 seconds

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
    setShowSupport(false);
    setShowLogoutConfirm(false);
    setPendingDeposits([]);
    setActiveTab('wallet');
    localStorage.removeItem('ashpay_user');
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const openTelegram = () => {
    window.location.href = 'https://t.me/Ashpay_Support';
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);

    const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/df7jd6uj6/auto/upload';
    const uploadPreset = 'ashpay_support';

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const response = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        return {
          name: file.name,
          url: data.secure_url,
          type: file.type,
          size: file.size,
        };
      });

      const uploadResults = await Promise.all(uploadPromises);
      setUploadedFiles([...uploadedFiles, ...uploadResults]);
      setIsUploading(false);
      alert(`✅ ${files.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      alert('❌ Failed to upload files. Please try again.');
    }
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
              disabled={isLoggingIn || isRegistering}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn || isRegistering ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Login' : 'Create Account'
              )}
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

      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 safe-area-bottom z-50">
        <div className="px-2 py-2.5">
          <div className="flex justify-around">
            <button 
              onClick={() => {
                setShowTools(false);
                setShowProfile(false);
                setShowTeam(false);
                setActiveTab('wallet');
              }}
              className={`flex flex-col items-center gap-0.5 min-w-[60px] py-1 active:scale-95 transition-transform ${activeTab === 'wallet' ? 'text-white' : 'text-gray-400'}`}
            >
              <Wallet className="w-6 h-6" />
              <span className="text-xs font-medium">Wallet</span>
            </button>
            <button
              onClick={() => {
                setShowProfile(false);
                setShowTeam(false);
                setShowTools(true);
                setActiveTab('payment');
              }}
              className={`flex flex-col items-center gap-0.5 min-w-[60px] py-1 active:scale-95 transition-transform ${activeTab === 'payment' ? 'text-white' : 'text-gray-400'}`}
            >
              <CreditCard className="w-6 h-6" />
              <span className="text-xs font-medium">Payment</span>
            </button>
            <button
              onClick={() => {
                setShowTools(false);
                setShowProfile(false);
                setShowTeam(true);
                setActiveTab('team');
              }}
              className={`flex flex-col items-center gap-0.5 min-w-[60px] py-1 active:scale-95 transition-transform ${activeTab === 'team' ? 'text-white' : 'text-gray-400'}`}
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-xs font-medium">Team</span>
            </button>
            <button
              onClick={() => {
                setShowTools(false);
                setShowTeam(false);
                setShowProfile(true);
                setActiveTab('profile');
              }}
              className={`flex flex-col items-center gap-0.5 min-w-[60px] py-1 active:scale-95 transition-transform ${activeTab === 'profile' ? 'text-white' : 'text-gray-400'}`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Profile</span>
            </button>
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
                disabled={isConfirmingDeposit}
                className="flex-1 bg-white/10 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={isConfirmingDeposit}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConfirmingDeposit ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-violet-900 to-purple-900 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowHistory(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('deposits')}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                  activeTab === 'deposits' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white/10 text-gray-300'
                }`}
              >
                Deposits
              </button>
              <button
                onClick={() => setActiveTab('withdrawals')}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                  activeTab === 'withdrawals' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white/10 text-gray-300'
                }`}
              >
                Withdrawals
              </button>
              <button
                onClick={() => setActiveTab('other')}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                  activeTab === 'other' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white/10 text-gray-300'
                }`}
              >
                Other
              </button>
            </div>

            {activeTab === 'deposits' && (
              <div>
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
                        <span className="text-gray-300 font-semibold text-sm">Total Pending:</span>
                        <span className="text-yellow-400 font-bold text-base">₹{calculatePendingBalance().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <h3 className="text-base font-semibold text-white mb-3">Completed Deposits</h3>
                {currentUser.transactions && currentUser.transactions.filter(tx => tx.type === 'deposit').length > 0 ? (
                  <div className="space-y-2">
                    {currentUser.transactions.filter(tx => tx.type === 'deposit').map(tx => (
                      <div key={tx.id} className="bg-white/10 p-3 rounded-xl">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-white font-semibold text-sm">{tx.usdtAmount} USDT</div>
                            <div className="text-gray-300 text-xs">{new Date(tx.date).toLocaleString()}</div>
                          </div>
                          <div className="text-green-400 font-semibold text-sm">+₹{tx.inrAmount.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300 text-center py-6 text-sm">No deposit transactions yet</p>
                )}
              </div>
            )}

            {activeTab === 'withdrawals' && (
              <div>
                <h3 className="text-base font-semibold text-white mb-3">Withdrawal Requests</h3>
                {currentUser.transactions && currentUser.transactions.filter(tx => tx.type === 'withdrawal').length > 0 ? (
                  <div className="space-y-2">
                    {currentUser.transactions.filter(tx => tx.type === 'withdrawal').map(tx => (
                      <div key={tx.id} className="bg-white/10 p-3 rounded-xl">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="text-white font-semibold text-sm">{tx.method === 'bank' ? 'Bank Transfer' : 'UPI'}</div>
                              {tx.status === 'completed' && <span className="text-base">✅</span>}
                              {tx.status === 'failed' && <span className="text-base">❌</span>}
                            </div>
                            <div className="text-gray-300 text-xs mb-1">{new Date(tx.date).toLocaleString()}</div>
                            <div className={`text-xs font-medium mb-1 ${tx.status === 'completed' ? 'text-green-400' : tx.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </div>
                            {tx.status === 'completed' && tx.paymentMethod && (
                              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 mt-2">
                                <div className="text-green-400 text-xs font-semibold mb-1">Paid via: {tx.paymentMethod.type === 'bank' ? 'Bank Transfer' : 'UPI'}</div>
                                {tx.paymentMethod.type === 'bank' ? (
                                  <div className="text-green-300 text-xs space-y-0.5">
                                    <div>A/C: {tx.paymentMethod.accountNumber}</div>
                                    <div>IFSC: {tx.paymentMethod.ifsc}</div>
                                  </div>
                                ) : (
                                  <div className="text-green-300 text-xs">{tx.paymentMethod.upiId}</div>
                                )}
                              </div>
                            )}
                            {tx.status === 'failed' && tx.remark && (
                              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mt-2">
                                <div className="text-red-400 text-xs font-semibold mb-1">Remark:</div>
                                <div className="text-red-300 text-xs">{tx.remark}</div>
                              </div>
                            )}
                            {tx.status === 'failed' && tx.refundAmount && (
                              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mt-2">
                                <div className="text-blue-400 text-xs font-semibold">Refunded: ₹{tx.refundAmount.toFixed(2)}</div>
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-2">
                            <div className={`font-semibold text-sm ${tx.status === 'failed' ? 'line-through text-gray-500' : 'text-red-400'}`}>
                              -₹{tx.amount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300 text-center py-6 text-sm">No withdrawal transactions yet</p>
                )}
              </div>
            )}

            {activeTab === 'other' && (
              <div>
                <h3 className="text-base font-semibold text-white mb-3">Bonus & Other Credits</h3>
                {currentUser.transactions && currentUser.transactions.filter(tx => tx.type === 'bonus' || tx.type === 'gift' || tx.type === 'reward' || tx.type === 'refund' || tx.type === 'compensation').length > 0 ? (
                  <div className="space-y-2">
                    {currentUser.transactions.filter(tx => tx.type === 'bonus' || tx.type === 'gift' || tx.type === 'reward' || tx.type === 'refund' || tx.type === 'compensation').map(tx => {
                      let icon, color, label;
                      if (tx.type === 'bonus') {
                        icon = '🎁';
                        color = 'text-purple-400';
                        label = 'Bonus';
                      } else if (tx.type === 'gift') {
                        icon = '🎀';
                        color = 'text-pink-400';
                        label = 'Gift';
                      } else if (tx.type === 'reward') {
                        icon = '⭐';
                        color = 'text-yellow-400';
                        label = 'Reward';
                      } else if (tx.type === 'refund') {
                        icon = '💰';
                        color = 'text-green-400';
                        label = 'Refund';
                      } else if (tx.type === 'compensation') {
                        icon = '🤝';
                        color = 'text-blue-400';
                        label = 'Compensation';
                      }
                      
                      return (
                        <div key={tx.id} className="bg-white/10 p-3 rounded-xl">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-2 flex-1">
                              <span className="text-xl flex-shrink-0">{icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-semibold text-sm">{label}</div>
                                <div className="text-gray-300 text-xs">{tx.description || 'Credit'}</div>
                                <div className="text-gray-400 text-xs mt-1">{new Date(tx.date).toLocaleString()}</div>
                                {tx.remark && (
                                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mt-2">
                                    <div className="text-blue-400 text-xs font-semibold mb-1">Admin Note:</div>
                                    <div className="text-blue-300 text-xs">{tx.remark}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className={`${color} font-semibold text-sm ml-2 flex-shrink-0`}>+₹{tx.amount.toFixed(2)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-300 text-center py-6 text-sm">No bonus or gift transactions yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showTeam && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-violet-900 to-purple-900 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
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
              <h3 className="text-base font-bold text-white mb-3">Your Referral Code</h3>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-white text-3xl font-bold text-center tracking-wider">
                  {referralCode}
                </div>
              </div>
              <p className="text-yellow-200 text-xs mt-3 text-center">Share this code with friends to earn rewards!</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">{currentUser.referrals?.length || 0}</div>
                <div className="text-gray-300 text-sm">Total Referrals</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-green-400">₹{currentUser.referralCommission?.toFixed(2) || '0.00'}</div>
                <div className="text-gray-300 text-sm">Total Earned</div>
              </div>
            </div>

            <h3 className="text-base font-semibold text-white mb-3">Your Referrals</h3>
            {currentUser.referrals && currentUser.referrals.length > 0 ? (
              <div className="space-y-2">
                {currentUser.referrals.map((referral, index) => (
                  <div key={index} className="bg-white/10 p-3 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-semibold text-sm">{referral.name}</div>
                        <div className="text-gray-300 text-xs">ID: {referral.id}</div>
                      </div>
                      <div className="text-gray-400 text-xs">{new Date(referral.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-300 text-center py-6 text-sm">No referrals yet. Share your code to get started!</p>
            )}
          </div>
        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-violet-900 to-purple-900 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setShowProfile(false);
                setActiveTab('wallet');
              }}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">{currentUser.name}</h2>
              <p className="text-gray-300 text-sm">ID: {currentUser.id}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 mb-4">
              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-xs">Mobile Number</label>
                  <div className="text-white font-semibold">{currentUser.mobile}</div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs">Member Since</label>
                  <div className="text-white font-semibold">{new Date(currentUser.createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <h3 className="text-base font-semibold text-white mb-3">Change Password</h3>
            <div className="space-y-3 mb-4">
              <input
                type="password"
                placeholder="Current Password"
                value={passwordChange.current}
                onChange={(e) => setPasswordChange({ ...passwordChange, current: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordChange.new}
                onChange={(e) => setPasswordChange({ ...passwordChange, new: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordChange.confirm}
                onChange={(e) => setPasswordChange({ ...passwordChange, confirm: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400"
              />
              {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
              <button
                onClick={handlePasswordChange}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {showTools && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-violet-900 to-purple-900 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setShowTools(false);
                setActiveTab('wallet');
              }}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-4">Payment Methods</h2>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPaymentMethod('bank')}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                  paymentMethod === 'bank' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white/10 text-gray-300'
                }`}
              >
                Bank Account
              </button>
              <button
                onClick={() => setPaymentMethod('upi')}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
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
                    className={`w-full px-4 py-3 bg-white/10 border ${paymentErrors.accountName ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-gray-400`}
                  />
                  {paymentErrors.accountName && <p className="text-red-400 text-xs mt-1">{paymentErrors.accountName}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={bankDetails.accountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 18);
                      setBankDetails({ ...bankDetails, accountNumber: value });
                      setPaymentErrors({ ...paymentErrors, accountNumber: '' });
                    }}
                    className={`w-full px-4 py-3 bg-white/10 border ${paymentErrors.accountNumber ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-gray-400`}
                  />
                  {paymentErrors.accountNumber && <p className="text-red-400 text-xs mt-1">{paymentErrors.accountNumber}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    value={bankDetails.ifsc}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().slice(0, 11);
                      setBankDetails({ ...bankDetails, ifsc: value });
                      setPaymentErrors({ ...paymentErrors, ifsc: '' });
                    }}
                    className={`w-full px-4 py-3 bg-white/10 border ${paymentErrors.ifsc ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-gray-400`}
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
                    className={`w-full px-4 py-3 bg-white/10 border ${paymentErrors.bankName ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-gray-400`}
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
                    setUpiId(e.target.value);
                    setPaymentErrors({ ...paymentErrors, upiId: '' });
                  }}
                  className={`w-full px-4 py-3 bg-white/10 border ${paymentErrors.upiId ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-gray-400`}
                />
                {paymentErrors.upiId && <p className="text-red-400 text-xs mt-1">{paymentErrors.upiId}</p>}
              </div>
            )}

            <button
              onClick={savePaymentDetails}
              disabled={isSavingPayment}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold mb-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingPayment ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Payment Method'
              )}
            </button>

            {showSuccessMessage && (
              <div className="mb-4 bg-green-500/20 border border-green-500/50 rounded-xl p-3 flex items-center gap-2 animate-pulse">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold text-sm">✅ Payment method saved successfully!</span>
              </div>
            )}

            <h3 className="text-base font-semibold text-white mb-3">Saved Payment Methods ({currentUser.paymentDetails?.length || 0}/6)</h3>
            <div ref={paymentMethodsRef}>
            {currentUser.paymentDetails && currentUser.paymentDetails.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {currentUser.paymentDetails.map((detail) => {
                  console.log('Rendering payment detail:', detail);
                  return (
                  <div key={detail.id} className="bg-white/10 p-4 rounded-xl border border-white/20 hover:bg-white/15 transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        {detail.type === 'bank' ? (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="bg-blue-500/20 p-1.5 rounded-lg">
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                              </div>
                              <span className="text-blue-400 text-xs font-semibold">BANK ACCOUNT</span>
                            </div>
                            <div className="text-white font-bold text-base mb-1 truncate">{detail.accountName}</div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs">Bank:</span>
                                <span className="text-gray-300 text-xs font-medium">{detail.bankName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs">A/C:</span>
                                <span className="text-gray-300 text-xs font-mono">{detail.accountNumber}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs">IFSC:</span>
                                <span className="text-gray-300 text-xs font-mono">{detail.ifsc}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="bg-purple-500/20 p-1.5 rounded-lg">
                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                              </div>
                              <span className="text-purple-400 text-xs font-semibold">UPI ID</span>
                            </div>
                            <div className="text-white font-bold text-base truncate">{detail.upiId}</div>
                            <div className="text-gray-400 text-xs mt-1">Instant Payment</div>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => confirmDeletePayment(detail.id)}
                        className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors flex-shrink-0"
                        title="Delete payment method"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-300 text-sm">No payment methods saved yet</p>
                <p className="text-gray-400 text-xs mt-1">Add one above to get started</p>
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {showDeletePaymentConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Payment Method?</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeletePaymentConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => removePaymentDetails(paymentToDelete)}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
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
              <button
                onClick={() => {
                  setShowSupport(false);
                  openTawkChat();
                }}
                className="inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-shadow"
              >
                <MessageCircle className="w-6 h-6" />
                Live Chat Support
              </button>
              
              <button
                onClick={openTelegram}
                className="inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-shadow"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
                Telegram Support
              </button>

              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-gray-300 text-sm mb-3">Upload files or screenshots</p>
                <label className={`inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg cursor-pointer active:scale-95 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Upload Files
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                <p className="text-gray-400 text-xs mt-2">Images, videos, PDFs & documents</p>
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-white text-sm font-semibold">Uploaded Files:</p>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="bg-white/10 p-2 rounded-lg flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{file.name}</p>
                          <p className="text-gray-400 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AshPay;
