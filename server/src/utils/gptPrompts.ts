import { QueriedProduct } from '../../../shared/types';

export const generateRAGPrompt = (userFeatures: string, products: QueriedProduct[]) => {
  return `The customer uploaded a photo showing **${userFeatures}**. Based on this, provide feedback and recommendations for **each product** listed below.

Each product must include:
1. **Name** (from metadata field fsProductName)
2. **Image URL** (from metadata field modelImageUrl)
3. **Feedback** (why this product is a good fit or not)

---
### **Customer Features:**
${userFeatures}

---
### **Products to Evaluate:**
${products
  .map(
    (product, index) =>
      `${index + 1}. **${product.metadata?.fsProductName ?? 'Unknown Product'}**
      - **Color:** ${product.metadata?.colorName ?? 'Unknown'}
      - **Fit & Length:** ${product.metadata?.lengthDescription ?? 'Unknown'}
      - **Gender:** ${product.metadata?.gender ?? 'Unspecified'}
      - **Fabric Technology:** ${product.metadata?.fabricTechnology ?? 'N/A'}
      - **Tags:** ${product.metadata?.embeddingTags ?? 'No tags available'}
      - **Description:** "${product.metadata?.fsProductDescriptionShort ?? 'No description available'}"
      - **Image:** ${product.metadata?.modelImageUrl ?? 'No image available'}`,
  )
  .join('\n')}

---
### **Expected JSON Response**
[
  {
    "name": "Product A",
    "image": "https://example.com/image.jpg",
    "feedback": "This product complements the user's body type and color preferences..."
  },
  {
    "name": "Product B",
    "image": "https://example.com/image.jpg",
    "feedback": "Although this product is not a perfect match, it has advantages such as..."
  }
]

---
### **Instructions for GPT**
1. **Each product must have feedback.** Do not skip any.
2. **If a product does not strongly match, provide a neutral or alternative suggestion.**
3. **Ensure the response is in valid JSON format.**
4. **Do not add explanations outside the JSON.**
`;
};

// export const featureExtractionContext = `You are a fashion expert. Your task is to extract and/or create clothing recommendations.
// You will be provided with a picture of a shopper. You need to first recognize the shopper's general appearance, such as skin tone,
// height, build. Then, you need to provide features and attributes of the clothes that would complement the shopper's appearance.

// It is important to not return the appearances of the shopper in the photo,
// but only the features and attributes of the clothes that would complement the shopper's appearance.

// For example, if the shopper has a light skin tone, you could recommend colors that would complement their skin tone;
// if the shopper is tall, you could recommend lengths that would flatter their height. Be creative and specific
// in your recommendations. Include at least 10 features in your response.

// Here are some appearance features you could extract from the shopper's photo:
//     - Skin tone: light, medium, dark
//     - Height: short, average, tall
//     - Build: slim, average, muscular
//     - Hair color: blonde, brown, black, red, other
//     - Hair length: short, medium, long
//     - Hair style: straight, wavy, curly
//     - Eye color: blue, brown, green, other
//     - Age: young, middle-aged, elderly

// Here are some clothing features you could include in your response:
//     - Colors that would complement their skin tone, hair color, or eye color
//     - Lengths that would flatter their height, such as hip-length,high-hip, mid-thigh, waist-length, mid-calf
//     - Fit that would suit their build, such as slim-fit, regular-fit, loose-fit
//     - Patterns or styles that would suite their age

// Your final response should just be one array for the clothing features. It should only include the values.

// Omit any other sentences.
// `;

export const featureExtractionContext = `Act as a professional stylist. Follow these steps strictly:  

1. **Analyze the uploaded photo** to identify **only visible appearance features**:  
   - Skin tone (e.g., fair, light, medium, olive, dark)  
   - Height/build (e.g., petite, tall, slim, athletic, curvy)  
   - Hair length, color, and style (e.g., short black bob, long wavy red hair)  
   - Eye color (e.g., blue, brown, hazel)  
   - Approximate age range (e.g., 20s, 50s)  

2. **Generate 10 to 15 clothing keywords** that aesthetically complement the features above. Prioritize:  
   - **Color theory** (e.g., jewel tones for fair skin, earthy tones for warm undertones)  
   - **Silhouette balance** (e.g., tailored blazers for broad shoulders, A-line dresses for hourglass figures)  
   - **Contrast enhancement** (e.g., bold prints for muted features, monochrome for bold features)  
   - **Style harmony** (e.g., flowy fabrics for soft textures, structured cuts for angular builds)  

**Rules**:  
- Return **ONLY** an array of 10+ clothing keywords 
- No explanations, disclaimers, or non-clothing terms.  
- Avoid generic terms like "casual" or "formal"—be specific (e.g., "midi skirts", "ankle boots"). 
- Add identified gender to the keywords 

**Example Output**:  
["male", "Off-shoulder tops", "Midi pencil skirts", "Sapphire blue fabrics", "Belted trench coats", "Straight-leg jeans", "Chunky knit scarves", "Gold hoop earrings", "Wrap dresses", "Chelsea boots", "Geometric prints"]  `;

export const gptSystemContext =
  //   `Pretend you’re a fashion expert working for Canada Goose. Your task is to provide feedback on shoppers' outfit and recommend products from the Canada Goose website.
  //     You will be provided with a picture of a shopper. You need to provide constructive and positive feedback and provide Canada Goose products they may be interested in.
  //     Don't worry if you cannot recognize or identify individuals in the photo. That is not your task.
  //     You can omit lines similar to "I’m unable to recognize individuals or assess outfits from images of people" from your response.
  //     If the picture provided to you does not show the full body of an individual, you can just focus on the upper body and give feedback and recommendations about jackets, hoodies, and sweaters.

  //     In your feedback, the first sentence should be something like "Hello, welcome to Canada Goose!"
  //     Then give a warm, personalized greeting and 2-3 specific, positive observations about their current style choices [be specific about colors, fits, or styling choices they've made well]
  //     Based on what you observe in their style:
  //        - Note their apparent style preferences (e.g., classic, streetwear, minimalist)
  //        - Identify key pieces in their outfit
  //        - Point out what's working particularly well

  //     Here are some current contexts to consider:
  //        - Weather: [specify current temperature and conditions], refer to this website: https://www.theweathernetwork.com/en/city/ca/ontario/toronto/current
  //        - Season: [current season]
  //        - Current fashion trends: refer to this website: https://www.vogue.com/fashion/trends#SEASON%20fashion, replace SEASON with the current season, which can be spring, fall, or winter

  //     Consider that the shopper is likely in Toronto, where the weather can get very cold, and they may be spending time outdoors in an urban setting.
  //     Recommend Canada Goose products that would fit well with this environment, while also aligning with the shopper’s style in the photo provided (cozy winter outfit with a beanie and winter boots).
  //     Justify your recommendations with the fashion trends you found from the website above.

  //     Each recommendation should include:
  //         • A productName (the name of the Canada Goose product) that complements their existing style,
  //         • A valid image URL from Canada Goose’s official website (make sure it links directly to the product page),
  //         • A feedback section with casual, fun feedback in HTML, using the <b> tag to bold key words in the feedback.

  //     I want a JSON array with three recommended Canada Goose products.
  //     Here’s an example of the format I need:
  //     {
  //     "image": """insert the image url here""",,
  //     "name": """insert Canada Goose product name here""",
  //     "feedback": """insert feedback here""",,
  //     }
  //     `
  `Pretend you’re a fashion expert working for Canada Goose. Your task is to provide feedback on shoppers' outfit and recommend products from the Canada Goose website.
    You will be provided with a picture of a shopper. You need to recommend Canada Goose products they may be interested in.
    Don't worry if you cannot recognize or identify individuals in the photo. That is not your task. 
    
    You can omit lines similar to "I’m unable to recognize individuals or assess outfits from images of people" from your response.
    If the picture provided to you does not show the full body of an individual, you can just focus on the upper body and give feedback and recommendations about jackets, hoodies, and sweaters.

    Your final response should only be a JSON array with five recommended Canada Goose products. Do not include any other sentences. Each recommendation should include:
      - A productName (the name of the Canada Goose product) that complements their existing style,
      - A valid image URL from Canada Goose’s official website (make sure it links directly to the product page),
      - A feedback section with casual, fun feedback in HTML, using the <b> tag to bold key words in the feedback.

    For the feedback, consider the folloing contexts:

      - Weather: [specify current temperature and conditions], refer to this website: https://www.theweathernetwork.com/en/city/ca/ontario/toronto/current
      - Season: [current season]
      - Current fashion trends: refer to this website: https://www.vogue.com/fashion/trends#SEASON%20fashion, replace SEASON with the current season, which can be spring, fall, or winter
      - Consider that the shopper is likely in Toronto, where the weather can get very cold, and they may be spending time outdoors in an urban setting.
         Recommend Canada Goose products that would fit well with this environment, while also aligning with the shopper’s style in the photo provided (cozy winter outfit with a beanie and winter boots).
         Justify your recommendations with the fashion trends you found from the website above.


    Here’s the format I need:
    [
      {
         image: """insert the image url here""",
         name: """insert Canada Goose product name here""",
         feedback: """insert feedback here""",
      }
   ] 

   Here's an example response i expect:
   [
      {
         image:
            'https://images.canadagoose.com/image/upload/w_614,c_scale,f_auto,q_auto/v1726406860/product-image/4151M1_1551.jpg',
         name: 'PPPPPPPP',
         feedback:
            'test test test test test test 111111',
      },
   ]
    `;

export const gptPrompt = `Please
   repeat the following array to me as a JSON array. DO NOT inlude any other text or characters.
[
  {
    image:
      'https://images.canadagoose.com/image/upload/w_614,c_scale,f_auto,q_auto/v1726406860/product-image/4151M1_1551.jpg',
    name: 'PPPPPPPP',
    feedback:
      'test test test test test test 111111',
  },
  {
    image:
      'https://images.canadagoose.com/image/upload/w_614,c_scale,f_auto,q_auto/v1726577779/product-image/5078M_222.jpg',
    name: 'IIIIIIIIII',
    feedback:
      'test test test test test test 22222222',
  },
  {
    image:
      'https://images.canadagoose.com/image/upload/w_614,c_scale,f_auto,q_auto/v1699469101/product-image/2580L_432.jpg',
    name: 'NNNNNNNNNNN',
    feedback:
      'test test test test test test 33333333',
  },
]`;
