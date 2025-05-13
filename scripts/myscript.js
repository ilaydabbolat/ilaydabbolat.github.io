// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the book recommendation form page
    const bookRecommendationForm = document.getElementById('book-recommendation-form');
    if (bookRecommendationForm) {
        bookRecommendationForm.addEventListener('submit', handleFormSubmit);
    }

    // Check if we're on the book finder page
    const bookFinderForm = document.getElementById('book-finder-form');
    if (bookFinderForm) {
        bookFinderForm.addEventListener('submit', handleBookFinderSubmit);
    }

    // Check if we're on the form results page
    if (window.location.pathname.includes('form-sonuc.html')) {
        displayFormData();
    }

    // Initialize dynamic content loaders
    loadDynamicContent();
});

// Handle the book recommendation form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const age = document.getElementById('age').value;
    const gender = document.querySelector('input[name="gender"]:checked')?.value || '';
    const genres = [];
    document.querySelectorAll('input[name="genres"]:checked').forEach(checkbox => {
        genres.push(checkbox.value);
    });
    const readingFrequency = document.getElementById('reading-frequency').value;
    const favoriteBook = document.getElementById('favorite-book').value;
    const comments = document.getElementById('comments').value;

    // Store form data in localStorage
    const formData = {
        name,
        email,
        age,
        gender,
        genres: genres.join(', '),
        readingFrequency,
        favoriteBook,
        comments,
        submissionDate: new Date().toLocaleString()
    };

    localStorage.setItem('bookRecommendationFormData', JSON.stringify(formData));
    
    // Redirect to results page
    window.location.href = 'form-sonuc.html';
}

// Display form data on the results page
function displayFormData() {
    const formDataString = localStorage.getItem('bookRecommendationFormData');
    
    if (formDataString) {
        const formData = JSON.parse(formDataString);
        const tableBody = document.getElementById('form-data-table').querySelector('tbody');
        
        // Clear any existing rows
        tableBody.innerHTML = '';
        
        // Create a row for each form field
        const fields = [
            { label: 'Ad Soyad', key: 'name' },
            { label: 'E-posta', key: 'email' },
            { label: 'Yaş', key: 'age' },
            { label: 'Cinsiyet', key: 'gender' },
            { label: 'İlgilendiği Türler', key: 'genres' },
            { label: 'Okuma Sıklığı', key: 'readingFrequency' },
            { label: 'Favori Kitap', key: 'favoriteBook' },
            { label: 'Yorumlar', key: 'comments' },
            { label: 'Gönderim Tarihi', key: 'submissionDate' }
        ];
        
        fields.forEach(field => {
            const row = document.createElement('tr');
            
            const labelCell = document.createElement('td');
            labelCell.textContent = field.label;
            row.appendChild(labelCell);
            
            const valueCell = document.createElement('td');
            valueCell.textContent = formData[field.key] || '-';
            row.appendChild(valueCell);
            
            tableBody.appendChild(row);
        });
        
        // Show book recommendations based on form data
        generateBookRecommendations(formData);
    } else {
        document.getElementById('form-results').innerHTML = '<p>Herhangi bir form verisi bulunamadı.</p>';
    }
}

// Ana kitap veritabanı - Tüm sayfalar için kullanılacak 8 kitap
const standardBooks = [
    { title: 'Suç ve Ceza', author: 'Fyodor Dostoyevski', genre: 'Roman', year: 1866, description: 'Psikolojik bir roman klasiği.' },
    { title: '1984', author: 'George Orwell', genre: 'Distopya', year: 1949, description: 'Distopik bir gelecek tasviri.' },
    { title: 'Simyacı', author: 'Paulo Coelho', genre: 'Roman', year: 1988, description: 'Kişisel bir yolculuk hikayesi.' },
    { title: 'Dune', author: 'Frank Herbert', genre: 'Bilim Kurgu', year: 1965, description: 'Epik bir uzay destanı.' },
    { title: 'Yüzüklerin Efendisi', author: 'J.R.R. Tolkien', genre: 'Fantastik', year: 1954, description: 'Fantastik edebiyatın başyapıtı.' },
    { title: 'Sapiens', author: 'Yuval Noah Harari', genre: 'Tarih', year: 2011, description: 'İnsanlık tarihine genel bir bakış.' },
    { title: 'Atomik Alışkanlıklar', author: 'James Clear', genre: 'Kişisel Gelişim', year: 2018, description: 'Küçük alışkanlıkların büyük etkisi.' },
    { title: 'Küçük Prens', author: 'Antoine de Saint-Exupéry', genre: 'Çocuk', year: 1943, description: 'Her yaştan okuyucuya hitap eden bir klasik.' }
];

// Generate book recommendations based on user preferences
function generateBookRecommendations(formData) {
    const recommendationsContainer = document.getElementById('book-recommendations');
    if (!recommendationsContainer) return;
    
    // Kitapları türlere göre kategorize et
    const booksByGenre = {
        'Roman': standardBooks.filter(book => book.genre === 'Roman' || book.genre === 'Distopya'),
        'Bilim Kurgu': standardBooks.filter(book => book.genre === 'Bilim Kurgu'),
        'Fantastik': standardBooks.filter(book => book.genre === 'Fantastik'),
        'Tarih': standardBooks.filter(book => book.genre === 'Tarih'),
        'Kişisel Gelişim': standardBooks.filter(book => book.genre === 'Kişisel Gelişim'),
        'Çocuk': standardBooks.filter(book => book.genre === 'Çocuk')
    };
    
    // Clear previous recommendations
    recommendationsContainer.innerHTML = '<h3>Size Özel Kitap Önerileri</h3>';
    
    // Parse user genres
    const userGenres = formData.genres.split(', ');
    const recommendedBooks = [];
    
    // Select books based on user preferences
    userGenres.forEach(genre => {
        if (booksByGenre[genre]) {
            // Add books from each genre the user likes
            booksByGenre[genre].forEach(book => {
                if (!recommendedBooks.some(b => b.title === book.title)) {
                    recommendedBooks.push(book);
                }
            });
        }
    });
    
    // If no specific genres matched or no recommendations, add some general recommendations
    if (recommendedBooks.length === 0) {
        recommendedBooks.push(standardBooks[0]); // Suç ve Ceza
        recommendedBooks.push(standardBooks[6]); // Atomik Alışkanlıklar
    }
    
    // Limit to maximum 4 recommendations
    const limitedRecommendations = recommendedBooks.slice(0, 4);
    
    // Display recommendations
    const bookList = document.createElement('div');
    bookList.className = 'book-grid';
    
    limitedRecommendations.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <h3>${book.title}</h3>
            <p class="author">${book.author}</p>
            <p>${book.description}</p>
        `;
        bookList.appendChild(bookCard);
    });
    
    recommendationsContainer.appendChild(bookList);
}

// Book finder functionality
function handleBookFinderSubmit(event) {
    event.preventDefault();
    
    const searchTerm = document.getElementById('search-term').value.toLowerCase();
    const searchType = document.getElementById('search-type').value;
    
    // Standart kitap veritabanını kullan
    const bookDatabase = standardBooks;
    
    // Filter books based on search criteria
    let filteredBooks;
    
    if (searchType === 'title') {
        filteredBooks = bookDatabase.filter(book => 
            book.title.toLowerCase().includes(searchTerm)
        );
    } else if (searchType === 'author') {
        filteredBooks = bookDatabase.filter(book => 
            book.author.toLowerCase().includes(searchTerm)
        );
    } else if (searchType === 'genre') {
        filteredBooks = bookDatabase.filter(book => 
            book.genre.toLowerCase().includes(searchTerm)
        );
    } else {
        filteredBooks = bookDatabase.filter(book => 
            book.title.toLowerCase().includes(searchTerm) || 
            book.author.toLowerCase().includes(searchTerm) || 
            book.genre.toLowerCase().includes(searchTerm)
        );
    }
    
    // Display results
    displaySearchResults(filteredBooks);
}

// Display search results
function displaySearchResults(books) {
    const resultsContainer = document.getElementById('search-results');
    
    if (books.length === 0) {
        resultsContainer.innerHTML = '<p>Aramanıza uygun kitap bulunamadı.</p>';
        return;
    }
    
    let resultsHTML = '<h3>Arama Sonuçları</h3>';
    resultsHTML += '<div class="table-container"><table>';
    resultsHTML += '<thead><tr><th>Kitap Adı</th><th>Yazar</th><th>Tür</th><th>Yayın Yılı</th></tr></thead>';
    resultsHTML += '<tbody>';
    
    books.forEach(book => {
        resultsHTML += `<tr>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.genre}</td>
            <td>${book.year}</td>
        </tr>`;
    });
    
    resultsHTML += '</tbody></table></div>';
    resultsContainer.innerHTML = resultsHTML;
}

// Load dynamic content based on page
function loadDynamicContent() {
    // Add current year to footer copyright
    const footerYear = document.querySelector('.footer-bottom');
    if (footerYear) {
        const currentYear = new Date().getFullYear();
        footerYear.innerHTML = `&copy; ${currentYear} Kitap Dünyası | Tüm Hakları Saklıdır`;
    }
    
    // Add active class to current page in navbar
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href').split('/').pop();
        if (currentPage === linkHref || (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
} 