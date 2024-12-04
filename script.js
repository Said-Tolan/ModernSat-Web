/**
 * ModernSat - متجر الإلكترونيات
 * الملف الرئيسي للوظائف والتفاعلات في المتجر
 * 
 * @version 1.0.0
 * @author Your Name
 * @copyright 2024
 */

// تهيئة المتغيرات العامة
let currentLanguage = localStorage.getItem('language') || 'ar';
let currentTheme = localStorage.getItem('theme') || 'light';
let products = JSON.parse(localStorage.getItem('products')) || [];
let isEditing = false;
let editingId = null;

// إعدادات اللغة والمظهر
// الحصول على العناصر من DOM
const productForm = document.getElementById('productForm');
const productsList = document.getElementById('productsList');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortByNameBtn = document.getElementById('sortByName');
const sortByPriceBtn = document.getElementById('sortByPrice');
const clearBtn = document.getElementById('clearBtn');
const themeToggle = document.getElementById('themeToggle');
const languageToggle = document.getElementById('languageToggle');

// إضافة أحداث المستمعين
productForm.addEventListener('submit', handleProductSubmit);
searchInput.addEventListener('input', filterProducts);
categoryFilter.addEventListener('change', filterProducts);
sortByNameBtn.addEventListener('click', () => sortProducts('name'));
sortByPriceBtn.addEventListener('click', () => sortProducts('price'));
clearBtn.addEventListener('click', clearForm);
themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    updateTheme();
});
languageToggle.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    updateLanguage();
});

// دالة تحديث اللغة
function updateLanguage() {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    
    // إخفاء/إظهار عناصر اللغة
    document.querySelectorAll('.ar, .en').forEach(el => {
        el.style.display = 'none';
    });
    
    document.querySelectorAll('.' + currentLanguage).forEach(el => {
        el.style.display = 'inline';
    });
    
    // تحديث النموذج
    updateFormPlaceholders();
    
    // تحديث قائمة المنتجات
    displayProducts();
    
    // حفظ تفضيل اللغة
    localStorage.setItem('language', currentLanguage);
}

// تحديث النصوص المؤقتة في النموذج
function updateFormPlaceholders() {
    const placeholders = {
        ar: {
            productName: 'أدخل اسم المنتج',
            productPrice: 'أدخل السعر',
            productQuantity: 'أدخل الكمية',
            productDescription: 'أدخل وصف المنتج',
            searchInput: 'ابحث عن منتج...'
        },
        en: {
            productName: 'Enter product name',
            productPrice: 'Enter price',
            productQuantity: 'Enter quantity',
            productDescription: 'Enter product description',
            searchInput: 'Search for a product...'
        }
    };

    document.getElementById('productName').placeholder = placeholders[currentLanguage].productName;
    document.getElementById('productPrice').placeholder = placeholders[currentLanguage].productPrice;
    document.getElementById('productQuantity').placeholder = placeholders[currentLanguage].productQuantity;
    document.getElementById('productDescription').placeholder = placeholders[currentLanguage].productDescription;
    document.getElementById('searchInput').placeholder = placeholders[currentLanguage].searchInput;
}

// دالة تحديث المظهر
function updateTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeIcon = document.querySelector('#themeToggle i');
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', currentTheme);
}

// دالة معالجة تقديم النموذج
function handleProductSubmit(e) {
    e.preventDefault();

    const productName = document.getElementById('productName').value;
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productCategory = document.getElementById('productCategory').value;
    const productQuantity = parseInt(document.getElementById('productQuantity').value);
    const productDescription = document.getElementById('productDescription').value;

    if (isEditing) {
        // تحديث المنتج الموجود
        const index = products.findIndex(p => p.id === editingId);
        products[index] = {
            id: editingId,
            name: productName,
            price: productPrice,
            category: productCategory,
            quantity: productQuantity,
            description: productDescription
        };
        showNotification(
            currentLanguage === 'ar' ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully',
            'success'
        );
    } else {
        // إضافة منتج جديد
        const newProduct = {
            id: Date.now(),
            name: productName,
            price: productPrice,
            category: productCategory,
            quantity: productQuantity,
            description: productDescription
        };
        products.push(newProduct);
        showNotification(
            currentLanguage === 'ar' ? 'تم إضافة المنتج بنجاح' : 'Product added successfully',
            'success'
        );
    }

    // حفظ في التخزين المحلي وتحديث العرض
    saveToLocalStorage();
    displayProducts();
    clearForm();
}

// دالة عرض المنتجات
function displayProducts(productsToShow = products) {
    productsList.innerHTML = '';
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const categoryName = currentLanguage === 'en' ? 
            getCategoryNameEn(product.category) : 
            getCategoryName(product.category);

        productCard.innerHTML = `
            <div class="product-image">
                <i class="fas fa-${getProductIcon(product.category)}"></i>
            </div>
            <h3>${product.name}</h3>
            <p class="price">${product.price} ${currentLanguage === 'en' ? 'EGP' : 'جنيه'}</p>
            <p class="category"><i class="fas fa-tag"></i> ${categoryName}</p>
            <p class="quantity"><i class="fas fa-boxes"></i> ${currentLanguage === 'en' ? 'Quantity: ' : 'الكمية: '}${product.quantity}</p>
            <p class="description"><i class="fas fa-info-circle"></i> ${product.description}</p>
            <div class="actions">
                <button onclick="editProduct(${product.id})" class="edit-btn">
                    <i class="fas fa-edit"></i> ${currentLanguage === 'en' ? 'Edit' : 'تعديل'}
                </button>
                <button onclick="deleteProduct(${product.id})" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        productsList.appendChild(productCard);
    });
}

// دالة تحرير المنتج
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        isEditing = true;
        editingId = id;
        
        // تعبئة النموذج بمعلومات المنتج
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('productDescription').value = product.description;
        
        // تغيير نص زر الإرسال وإضافة تأثيرات بصرية
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.textContent = currentLanguage === 'en' ? 'Update Product' : 'تحديث المنتج';
        submitBtn.classList.add('edit-mode');
        
        // تمرير إلى نموذج التحرير
        document.querySelector('.product-form').scrollIntoView({ behavior: 'smooth' });
        
        // إضافة تأثير وميض للنموذج
        const form = document.querySelector('.product-form');
        form.classList.add('highlight');
        setTimeout(() => form.classList.remove('highlight'), 1000);
    }
}

// دالة حذف المنتج
function deleteProduct(id) {
    const confirmMessage = currentLanguage === 'en' ? 
        'Are you sure you want to delete this product?' : 
        'هل أنت متأكد من حذف هذا المنتج؟';

    if (confirm(confirmMessage)) {
        products = products.filter(p => p.id !== id);
        saveToLocalStorage();
        displayProducts();
        const successMessage = currentLanguage === 'en' ? 
            'Product deleted successfully' : 
            'تم حذف المنتج بنجاح';
        showNotification(successMessage, 'success');
    }
}

// دالة تصفية المنتجات
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    let filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    displayProducts(filteredProducts);
}

// دالة ترتيب المنتجات
function sortProducts(criteria) {
    const sortedProducts = [...products];
    sortedProducts.sort((a, b) => {
        if (criteria === 'name') {
            return a.name.localeCompare(b.name);
        } else if (criteria === 'price') {
            return a.price - b.price;
        }
    });
    displayProducts(sortedProducts);
}

// دالة مسح النموذج
function clearForm() {
    productForm.reset();
    isEditing = false;
    editingId = null;
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = currentLanguage === 'en' ? 'Add Product' : 'إضافة منتج';
}

// دالة الحفظ في التخزين المحلي
function saveToLocalStorage() {
    localStorage.setItem('products', JSON.stringify(products));
}

// دالة إظهار الإشعارات
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// دالة الحصول على اسم الفئة بالعربية
function getCategoryName(category) {
    const categories = {
        'tv': 'تلفزيونات',
        'receivers': 'رسيفرات',
        'accessories': 'إكسسوارات',
        'cables': 'كابلات'
    };
    return categories[category] || category;
}

// دالة الحصول على اسم الفئة بالإنجليزية
function getCategoryNameEn(category) {
    const categories = {
        'tv': 'TVs',
        'receivers': 'Receivers',
        'accessories': 'Accessories',
        'cables': 'Cables'
    };
    return categories[category] || category;
}

// دالة الحصول على أيقونة المنتج حسب الفئة
function getProductIcon(category) {
    const icons = {
        'tv': 'tv',
        'receivers': 'satellite-dish',
        'accessories': 'plug',
        'cables': 'network-wired'
    };
    return icons[category] || 'box';
}

// مستمع حدث تحميل الصفحة
window.addEventListener('load', () => {
    updateLanguage();
    updateTheme();
    displayProducts();
});
