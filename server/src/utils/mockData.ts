import { PREAPIResponse, QueriedProduct } from './types';

export const mockData: PREAPIResponse = {
  '0': '@fabuloumiss: Maybe add a pop of color with a bright cushion or blanket.',
  '1': '@runwayace: Loving the chic and simple hairstyle, very elegant! ❤️',
  '2': '@fascinfan: The blinds look super modern and sleek. ✨',
  '3': '@luxuart: A small plant could add a bit of life to the decor.',
  '4': '@awesoguru: The understated colors are really soothing to look at. 😍😍',
  '5': '@impsist: The subtle shadows create a relaxed atmosphere. ✨❤️😍',
  '6': '@fancyguru: Darker hair contrasts nicely with the lighter background. 😍',
  '7': '@luxlady: Minimalist decor is always a win in my book. ️👍️👍',
  '8': '@desigexp: The lamp in the background adds a warm and cozy vibe. ❤️',
  '9': '@fascinaarti: The subtle use of light and shadow is on point. ️👍',
  '10': '@extraormiss: The way the light hits the room is just perfect.',
  '11': "@wondesiste: Loving the casual and focused vibe you're giving off. ️👍",
  '12': '@fashionsiste: The neutral color of the walls really makes the whole scene calm and inviting. 😍',
  '13': '@captace: The balance between the light and darker elements is perfect. ✨',
  '14': '@imprelover: The room has a lovely serene ambiance.',
  '15': '@runmiss: The blinds have a super modern and clean look to them! ❤️✨',
  '16': '@splensis: Sturdy bookshelves in the back? Yes, please! ❤️',
  '17': '@elaborguru: That lampshade looks super stylish! ️👍️👍',
  '18': "@grandace: Neat and clean desk, you're killing it! ✨😍✨",
  '19': '@exqulove: The partially visible shelves add a lot of character. ️👍',
  likes: 23291,
  views: 443810,
  comments: 20,
};

export const mockQueriedProducts: QueriedProduct[] = [
  {
    id: 'Red Jacket',
    metadata: {
      colorName: 'Black',
      embeddingTags: 'men, patch, quilt, packable, recycle, black, winter, puffy, reverse, hat',
      fabricTechnology: 'Kind-Fleece Recycled-EnduraLuxe',
      fsProductDescriptionShort:
        'Designed for unpredictable weather, the Puffer Reversible Bucket Hat is fully reversible for two looks in one.',
      fsProductName: 'Puffer Reversible Bucket Hat',
      gender: 'male',
      lengthDescription: 'None',
      modelImageUrl: 'https://images.canadagoose.com/image/upload/product-image/6888U_61.jpg',
      otherProductImageUrl:
        'https://images.canadagoose.com/image/upload/product-image/6888U_61_p.png',
    },
  },
  // {
  //   id: 'Blue Parka',
  //   metadata: {
  //     modelImageUrl: 'https://images.canadagoose.com/image/upload/product-image/2054M_222.jpg',
  //     color: 'blue',
  //     fit: 'regular',
  //     length: 'medium',
  //   },
  // },
  // {
  //   id: 'Black Hoodie',
  //   metadata: {
  //     modelImageUrl: 'https://images.canadagoose.com/image/upload/product-image/2079M_61.jpg',
  //     color: 'black',
  //     fit: 'loose',
  //     length: 'long',
  //   },
  // },
];
