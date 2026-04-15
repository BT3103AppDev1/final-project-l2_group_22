const BACKEND_URL = import.meta.env.VITE_RECEIPT_OCR_URL || 'http://localhost:8000';
const DEFAULT_SCHEMA = {
    merchant_name: 'string',
    merchant_address: 'string',
    transaction_date: 'string',
    transaction_time: 'string',
    total_amount: 'number',
    line_items: [
        {
            item_name: 'string',
            item_quantity: 'number',
            item_price: 'number',
        },
    ],
};

export const ImageService = {
    /**
     * Sends the image to the backend for OCR processing and returns the extracted data.
     * @param {File} imageFile - The image file to be processed.
     * @returns {Promise<Object>} - The extracted data from the receipt.
     */
    async processImage(imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('json_schema', JSON.stringify(DEFAULT_SCHEMA));

        try {
            const response = await fetch(`${BACKEND_URL}/ocr/`, {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                const contentType = response.headers.get('content-type') || '';
                let errorData = {};

                if (contentType.includes('application/json')) {
                    errorData = await response.json().catch(() => ({}));
                } else {
                    const text = await response.text().catch(() => '');
                    errorData = text ? { detail: text } : {};
                }

                const detail = errorData.detail || errorData.message || `Backend error: ${response.status}`;
                const error = new Error(detail);
                error.status = response.status;
                error.payload = errorData;
                throw error;
            }

            return await response.json();
        } catch (error) {
            console.error("ImageService failed with error: ", error);
            throw error;
        }
    }

}