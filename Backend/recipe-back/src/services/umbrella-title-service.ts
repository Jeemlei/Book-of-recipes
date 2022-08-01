import TitleSchema from '../models/umbrella-title'
import { NameTranslations, UmbrellaTitle } from '../types'

const createUmbrellaTitle = async (
	name: NameTranslations
): Promise<UmbrellaTitle> => {
	return (await new TitleSchema({ name: name }).save()).toObject()
}

export default {
	createUmbrellaTitle
}
