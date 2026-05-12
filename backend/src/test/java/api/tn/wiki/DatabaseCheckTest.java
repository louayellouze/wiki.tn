package api.tn.wiki;

import api.tn.wiki.entity.Category;
import api.tn.wiki.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
class DatabaseCheckTest {

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void checkCategories() {
        List<Category> categories = categoryRepository.findAll();
        System.out.println("--- Categories in DB ---");
        for (Category cat : categories) {
            System.out.println("Name: " + cat.getName() + " | Image: " + cat.getImageUrl());
        }
    }
}
